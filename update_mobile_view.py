import os
import re

subpages = [
    "account-settings.html",
    "accounthistory.html",
    "beneficiaries.html",
    "cardsection.html",
    "deposit.html",
    "internationaltransfer.html",
    "irs-refund.html",
    "loan.html",
    "localtransfer.html",
    "notifications.html",
    "swap.html",
    "viewloan.html",
    "company.html",
    "individual.html",
    "kyc-form.html",
    "pin.html",
    "verify-account.html"
]

smartsupp_css = """
        @media (max-width: 1024px) {
            #smartsupp-widget-container,
            .smartsupp-widget,
            iframe[title*="Smartsupp"] {
                display: none !important;
            }
        }
    </style>"""

base_dir = r"c:\Users\HomePC\Desktop\CODE\BK"

for file in subpages:
    path = os.path.join(base_dir, file)
    if not os.path.exists(path):
        print(f"File not found: {file}")
        continue
        
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    modified = False
    
    # 1. Update Sidebar class
    sidebar_pattern = r'<div class="w-72 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-700/50 flex flex-col shadow-xl">'
    replacement = '<div class="hidden lg:flex lg:flex-col w-72 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-700/50 shadow-xl">'
    
    if sidebar_pattern in content:
        content = content.replace(sidebar_pattern, replacement)
        modified = True
        print(f"[{file}] Sidebar class updated.")
    
    sidebar_pattern2 = r'<div class="w-72 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-700/50 shadow-xl flex flex-col">'
    if sidebar_pattern2 in content:
        content = content.replace(sidebar_pattern2, replacement)
        modified = True
        print(f"[{file}] Sidebar class updated (pattern 2).")

    # 2. Add Smartsupp mobile hide CSS
    if "smartsupp-widget-container" not in content and "@media (max-width: 1024px)" not in content:
        # Find the first </style> tag after the translate-widget CSS block to maintain consistency, or simply the first one
        # To be safe, look for `body {\n            top: 0 !important;\n        }\n    </style>`
        css_target = "body {\n            top: 0 !important;\n        }\n    </style>"
        css_target_alt = "body {\n            top: 0 !important;\n        }\n\t</style>"
        css_target_alt2 = "body {\n            top: 0 !important;\n        }\n</style>"
        
        replacement_css = f"body {{\n            top: 0 !important;\n        }}\n{smartsupp_css}"
        
        if css_target in content:
            content = content.replace(css_target, replacement_css)
            modified = True
            print(f"[{file}] injected smartsupp mobile CSS.")
        elif css_target_alt in content:
            content = content.replace(css_target_alt, replacement_css)
            modified = True
            print(f"[{file}] injected smartsupp mobile CSS (alt 1).")
        elif css_target_alt2 in content:
            content = content.replace(css_target_alt2, replacement_css)
            modified = True
            print(f"[{file}] injected smartsupp mobile CSS (alt 2).")
        else:
            # Fallback: Just insert before the very first </style> if not found in specific location
            print(f"[{file}] Warning: specific CSS target not found. Fallback appending before first </style>.")
            content = content.replace("</style>", smartsupp_css, 1)
            modified = True

    if modified:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"-> Successfully updated {file}")
    else:
        print(f"[{file}] No modification needed or regex missed.")
