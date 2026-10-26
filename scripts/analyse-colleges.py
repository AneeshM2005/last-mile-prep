#!/usr/bin/env python3
"""
scripts/analyse-colleges.py

Dev-time script to analyse dream-college images for the Countdown card.
Measures the worst-case luminance in the card's top-left text region (left 65%, top 40%)
across common viewport card shapes (tall laptop, stacked phone, standard desktop).

Selects:
- textTone: 'ink' (#2B2B2B) with paper-white wash (#FAF9F8)
         or 'light' (#FFFFFF) with deep sage wash (#2F4A32)
- wash: smallest integer percentage in [0..40] reaching >= 4.5:1 (capped at 45% max).

Flags any images that cannot reach 4.5:1 with wash <= 40% so they can be recropped/replaced.
Can update app/src/domain/colleges.ts with the computed tone and wash values.
"""

import os
import sys
import re
from PIL import Image
import numpy as np

# Script directory and repo paths
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.dirname(SCRIPT_DIR) if os.path.basename(SCRIPT_DIR) == 'scripts' else SCRIPT_DIR
COLLEGES_DIR = os.path.join(REPO_ROOT, 'app', 'public', 'images', 'colleges')
COLLEGES_TS = os.path.join(REPO_ROOT, 'app', 'src', 'domain', 'colleges.ts')

# Fallback if run inside app/
if not os.path.isdir(COLLEGES_DIR):
    COLLEGES_DIR = os.path.join(REPO_ROOT, 'public', 'images', 'colleges')
    COLLEGES_TS = os.path.join(REPO_ROOT, 'src', 'domain', 'colleges.ts')

def srgb_to_lin(c):
    c = c / 255.0
    return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)

def rel_lum(r, g, b):
    return 0.2126 * srgb_to_lin(r) + 0.7152 * srgb_to_lin(g) + 0.0722 * srgb_to_lin(b)

def contrast_ratio(l1, l2):
    high = max(l1, l2)
    low = min(l1, l2)
    return (high + 0.05) / (low + 0.05)

# Text Luminances:
# Ink: #2B2B2B
L_INK = rel_lum(43, 43, 43)
# Sage 900: #2F4A32 (if used for countdown in ink tone)
L_SAGE900 = rel_lum(47, 74, 50)
# White: #FFFFFF
L_WHITE = rel_lum(255, 255, 255)

# Wash colors:
WASH_PAPER = np.array([250, 249, 248], dtype=np.float64)  # #FAF9F8
WASH_SAGE = np.array([47, 74, 50], dtype=np.float64)     # #2F4A32 (sage-900)

# Card aspect ratios to evaluate:
# 1) Tall laptop: 320x260 (aspect 1.231)
# 2) Stacked phone: 360x220 (aspect 1.636)
# 3) Desktop card: 360x240 (aspect 1.500)
CARD_ASPECTS = [320/260, 360/220, 360/240]

def extract_text_regions(img_path):
    im = Image.open(img_path).convert('RGB')
    W_img, H_img = im.size
    regions = []
    for asp in CARD_ASPECTS:
        if W_img / H_img > asp:
            crop_h = H_img
            crop_w = int(round(H_img * asp))
            crop_x = int(round((W_img - crop_w) * 0.5))
            crop_y = 0
        else:
            crop_w = W_img
            crop_h = int(round(W_img / asp))
            crop_x = 0
            crop_y = int(round((H_img - crop_h) * 0.5))
        reg_w = int(round(crop_w * 0.65))
        reg_h = int(round(crop_h * 0.40))
        reg = im.crop((crop_x, crop_y, crop_x + reg_w, crop_y + reg_h)).resize((65, 40), Image.Resampling.BILINEAR)
        regions.append(np.array(reg, dtype=np.float64))
    return regions

def evaluate_college(college_id):
    img_name = f"{college_id}.webp"
    img_path = os.path.join(COLLEGES_DIR, img_name)
    if not os.path.isfile(img_path):
        return None
    
    regions = extract_text_regions(img_path)
    
    # Evaluate Ink tone across washes 0..45
    ink_evals = []
    for w in range(0, 46):
        w_frac = w / 100.0
        worst_cr_num = 999.0
        worst_cr_countdown = 999.0
        worst_cr_days = 999.0
        for reg in regions:
            washed = reg * (1.0 - w_frac) + WASH_PAPER * w_frac
            lums = rel_lum(washed[..., 0], washed[..., 1], washed[..., 2])
            # Worst-case pixel for dark text: 10th percentile
            p10 = float(np.percentile(lums, 10))
            cr_num = contrast_ratio(p10, L_INK)
            cr_cd = contrast_ratio(p10, L_INK)
            cr_days = contrast_ratio(p10, L_INK)
            if cr_num < worst_cr_num: worst_cr_num = cr_num
            if cr_cd < worst_cr_countdown: worst_cr_countdown = cr_cd
            if cr_days < worst_cr_days: worst_cr_days = cr_days
        ink_evals.append((w, worst_cr_num, worst_cr_countdown, worst_cr_days))

    # Evaluate Light tone across washes 0..45
    light_evals = []
    for w in range(0, 46):
        w_frac = w / 100.0
        worst_cr_num = 999.0
        worst_cr_countdown = 999.0
        worst_cr_days = 999.0
        for reg in regions:
            washed = reg * (1.0 - w_frac) + WASH_SAGE * w_frac
            lums = rel_lum(washed[..., 0], washed[..., 1], washed[..., 2])
            # Worst-case pixel for white text: 90th percentile
            p90 = float(np.percentile(lums, 90))
            cr_num = contrast_ratio(L_WHITE, p90)
            cr_cd = contrast_ratio(L_WHITE, p90)
            cr_days = contrast_ratio(L_WHITE, p90)
            if cr_num < worst_cr_num: worst_cr_num = cr_num
            if cr_cd < worst_cr_countdown: worst_cr_countdown = cr_cd
            if cr_days < worst_cr_days: worst_cr_days = cr_days
        light_evals.append((w, worst_cr_num, worst_cr_countdown, worst_cr_days))

    # Decision logic:
    # 1. Does ink or light reach >= 4.5:1 with smaller wash?
    # 2. Prefer reaching 7:1 if wash <= 30.
    ink_at_0 = ink_evals[0][1]
    light_at_0 = light_evals[0][1]

    ink_reach_7 = [x for x in ink_evals if x[1] >= 7.0 and x[0] <= 30]
    light_reach_7 = [x for x in light_evals if x[1] >= 7.0 and x[0] <= 30]

    ink_reach_45 = [x for x in ink_evals if x[1] >= 4.5 and x[0] <= 40]
    light_reach_45 = [x for x in light_evals if x[1] >= 4.5 and x[0] <= 40]

    # If already high contrast at 0 wash:
    if ink_at_0 >= 7.0 and ink_at_0 > light_at_0:
        chosen_tone = 'ink'
        chosen_wash = 0
    elif light_at_0 >= 7.0 and light_at_0 > ink_at_0:
        chosen_tone = 'light'
        chosen_wash = 0
    elif ink_reach_7 and (not light_reach_7 or ink_reach_7[0][0] <= light_reach_7[0][0]):
        chosen_tone = 'ink'
        chosen_wash = ink_reach_7[0][0]
    elif light_reach_7:
        chosen_tone = 'light'
        chosen_wash = light_reach_7[0][0]
    elif ink_reach_45 and (not light_reach_45 or ink_reach_45[0][0] <= light_reach_45[0][0]):
        chosen_tone = 'ink'
        chosen_wash = ink_reach_45[0][0]
    elif light_reach_45:
        chosen_tone = 'light'
        chosen_wash = light_reach_45[0][0]
    else:
        # Cannot reach 4.5:1 with <= 40% wash; cap at 45% and pick the tone with higher contrast at 45%
        if ink_evals[45][1] >= light_evals[45][1]:
            chosen_tone = 'ink'
            chosen_wash = 45
        else:
            chosen_tone = 'light'
            chosen_wash = 45

    eval_list = ink_evals if chosen_tone == 'ink' else light_evals
    cr_data = eval_list[chosen_wash]
    is_flagged = cr_data[1] < 4.5

    return {
        'id': college_id,
        'tone': chosen_tone,
        'wash': chosen_wash,
        'cr_num': cr_data[1],
        'cr_cd': cr_data[2],
        'cr_days': cr_data[3],
        'flagged': is_flagged
    }

def main():
    update_file = '--update' in sys.argv
    colleges = [
        ('fms', 'FMS'),
        ('iift-delhi', 'IIFT Delhi'),
        ('iim-ahmedabad', 'IIM Ahmedabad'),
        ('iim-bangalore', 'IIM Bangalore'),
        ('iim-calcutta', 'IIM Calcutta'),
        ('iim-indore', 'IIM Indore'),
        ('iim-kozhikode', 'IIM Kozhikode'),
        ('iim-lucknow', 'IIM Lucknow'),
        ('iim-mumbai', 'IIM Mumbai'),
        ('iim-shillong', 'IIM Shillong'),
        ('iim-trichy', 'IIM Trichy'),
        ('iit-delhi', 'IIT Delhi'),
        ('mdi-gurgaon', 'MDI Gurgaon'),
        ('sjmsom-iit-b', 'SJMSOM, IIT B'),
        ('spjimr', 'SPJIMR'),
        ('tiss', 'TISS'),
        ('xlri-jamshedpur', 'XLRI Jamshedpur'),
    ]

    results = []
    print(f"\n{'College':<18} | {'Tone':<6} | {'Wash %':<6} | {'Number CR':<10} | {'Countdown CR':<12} | {'Days CR':<10} | {'Status'}")
    print("-" * 85)

    for cid, name in colleges:
        res = evaluate_college(cid)
        if res:
            res['name'] = name
            results.append(res)
            status = "NEEDS RECROP" if res['flagged'] else "PASS"
            print(f"{name:<18} | {res['tone']:<6} | {res['wash']:>5}% | {res['cr_num']:>9.2f}:1 | {res['cr_cd']:>11.2f}:1 | {res['cr_days']:>9.2f}:1 | {status}")

    print("-" * 85)
    flagged = [r for r in results if r['flagged']]
    if flagged:
        print(f"\nNotice: {len(flagged)} college image(s) flagged (contrast < 4.5:1 with wash capped at 45%):")
        for f in flagged:
            print(f"  - {f['name']} ({f['id']}): CR {f['cr_num']:.2f}:1 with {f['wash']}% wash")
    else:
        print("\nAll colleges meet or exceed 4.5:1 contrast!")

    if update_file:
        print(f"\nUpdating {COLLEGES_TS} with computed textTone and wash...")
        with open(COLLEGES_TS, 'r', encoding='utf-8') as f:
            content = f.read()

        for r in results:
            cid = r['id']
            tone = r['tone']
            wash = r['wash']
            # Find the block for this college
            pattern = re.compile(rf"(id:\s*'{cid}',\s*name:\s*'[^']+',\s*image:\s*'[^']+',\s*focus:\s*'[^']+',\s*legacyIds:\s*\[[^\]]*\],?)")
            m = pattern.search(content)
            if m:
                old_block = m.group(1)
                new_block = f"{old_block}\n    textTone: '{tone}',\n    wash: {wash},"
                # replace if textTone not already present
                if f"textTone: '{tone}'" not in content:
                    content = content.replace(old_block, new_block, 1)

        with open(COLLEGES_TS, 'w', encoding='utf-8') as f:
            f.write(content)
        print("Updated colleges.ts successfully.")

    if '--fail-under-4-5' in sys.argv and flagged:
        print(f"\nError: {len(flagged)} college(s) fell below the 4.5:1 contrast floor.", file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()
