import os

navbar_html = """
    <!-- Mobile Floating Bottom Navbar -->
    <div class="lg:hidden fixed bottom-4 left-4 right-4 z-50">
        <div class="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] px-2 py-2">
            <div class="flex items-center justify-between pointer-events-auto">
                <!-- Home -->
                <a href="dashboard.html" class="flex flex-col items-center justify-center w-16 h-12 rounded-xl transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 text-primary-600 dark:text-primary-400">
                    <i class="fa-solid fa-house mb-1 text-lg"></i>
                    <span class="text-[10px] font-medium">Home</span>
                </a>
                
                <!-- Activity -->
                <a href="accounthistory.html" class="flex flex-col items-center justify-center w-16 h-12 rounded-xl transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
                    <i class="fa-solid fa-chart-line mb-1 text-lg"></i>
                    <span class="text-[10px] font-medium relative">Activity</span>
                </a>
                
                <!-- Transfer -->
                <a href="localtransfer.html" class="flex flex-col items-center justify-center w-16 h-12 rounded-xl transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
                    <i class="fa-solid fa-paper-plane mb-1 text-lg"></i>
                    <span class="text-[10px] font-medium">Transfer</span>
                </a>
                
                <!-- Cards -->
                <a href="cardsection.html" class="flex flex-col items-center justify-center w-16 h-12 rounded-xl transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
                    <i class="fa-solid fa-credit-card mb-1 text-lg"></i>
                    <span class="text-[10px] font-medium">Cards</span>
                </a>
                
                <!-- Profile -->
                <a href="account-settings.html" class="flex flex-col items-center justify-center w-16 h-12 rounded-xl transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
                    <i class="fa-solid fa-user mb-1 text-lg"></i>
                    <span class="text-[10px] font-medium">Profile</span>
                </a>
            </div>
        </div>
    </div>
"""

subpages = [
    "account-settings.html",
    "accounthistory.html",
    "beneficiaries.html",
    "cards.html",
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

for file in subpages:
    path = os.path.join(r"c:\Users\HomePC\Desktop\CODE\BK", file)
    if not os.path.exists(path):
        print(f"File not found: {file}")
        continue
        
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    if "<!-- Mobile Floating Bottom Navbar -->" in content:
        print(f"Navbar already in {file}")
        continue
        
    # Inject before the first occurrence of `<!-- Smartsupp Live Chat script -->`
    # or before `<script>` tag that is near the bottom, or `</body>`
    
    if "<!-- Smartsupp Live Chat script -->" in content:
        content = content.replace("<!-- Smartsupp Live Chat script -->", navbar_html + "\n    <!-- Smartsupp Live Chat script -->", 1)
        print(f"Injected into {file} before Smartsupp")
    elif "</body>" in content:
        content = content.replace("</body>", navbar_html + "\n</body>", 1)
        print(f"Injected into {file} before </body>")
    else:
        content += navbar_html
        print(f"Appended to {file}")
        
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Done inserting navbars.")
