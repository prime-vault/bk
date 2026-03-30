import os

subpages = [
    "dashboard.html",
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

base_dir = r"c:\Users\HomePC\Desktop\CODE\BK"

target_str = '''                <!-- Cards -->
                <a href="cards.html" class="flex flex-col items-center justify-center w-16 h-12 rounded-xl transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">'''

replacement_str = '''                <!-- Cards -->
                <a href="cardsection.html" class="flex flex-col items-center justify-center w-16 h-12 rounded-xl transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">'''

for file in subpages:
    path = os.path.join(base_dir, file)
    if not os.path.exists(path):
        continue
        
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if target_str in content:
        content = content.replace(target_str, replacement_str)
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {file}")
    else:
        # Fallback for spacing differences
        if '<!-- Cards -->\n                <a href="cards.html"' in content:
            content = content.replace('<!-- Cards -->\n                <a href="cards.html"', '<!-- Cards -->\n                <a href="cardsection.html"')
            with open(path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Updated {file} (using fallback)")
        else:
            print(f"No changes for {file}")

print("Done updating navbar links.")
