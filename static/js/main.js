// پیج لوڈ ہوتے ہی چیک کرے گا کہ پہلے سے کون سا موڈ اور زبان محفوظ ہے
document.addEventListener("DOMContentLoaded", function () {
    // 1. ڈارک موڈ برقرار رکھنا
    const savedTheme = localStorage.getItem("smart_pos_theme") || "light";
    setTheme(savedTheme);

    // 2. اردو / انگلش زبان برقرار رکھنا
    const savedLang = localStorage.getItem("smart_pos_lang") || "en";
    setLanguage(savedLang);
});

// ڈارک موڈ ٹوگل کرنے کا فنکشن
function toggleDarkMode() {
    const htmlTag = document.getElementById("htmlTag");
    const currentTheme = htmlTag.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    
    localStorage.setItem("smart_pos_theme", newTheme);
    setTheme(newTheme);
}

// تھیم لاگو کرنے کا فنکشن
function setTheme(theme) {
    const htmlTag = document.getElementById("htmlTag");
    const darkIcon = document.getElementById("darkIcon");
    const darkText = document.getElementById("darkText");

    htmlTag.setAttribute("data-theme", theme);

    if (theme === "dark") {
        if (darkIcon) {
            darkIcon.classList.remove("fa-moon");
            darkIcon.classList.add("fa-sun");
        }
        if (darkText) darkText.innerText = "Light";
    } else {
        if (darkIcon) {
            darkIcon.classList.remove("fa-sun");
            darkIcon.classList.add("fa-moon");
        }
        if (darkText) darkText.innerText = "Dark";
    }
}

// زبان تبدیل کرنے کا فنکشن (Urdu / English)
function toggleLanguage() {
    const htmlTag = document.getElementById("htmlTag");
    const currentDir = htmlTag.getAttribute("dir");
    const newLang = currentDir === "rtl" ? "en" : "ur";

    localStorage.setItem("smart_pos_lang", newLang);
    setLanguage(newLang);
}

// زبان لاگو کرنے کا فنکشن
function setLanguage(lang) {
    const htmlTag = document.getElementById("htmlTag");
    const langBtnText = document.getElementById("langBtnText");
    const elements = document.querySelectorAll(".lang-text");

    if (lang === "ur") {
        htmlTag.setAttribute("dir", "rtl");
        htmlTag.setAttribute("lang", "ur");
        if (langBtnText) langBtnText.innerText = "English";

        elements.forEach(el => {
            if (el.getAttribute("data-ur")) {
                el.innerText = el.getAttribute("data-ur");
            }
        });
    } else {
        htmlTag.setAttribute("dir", "ltr");
        htmlTag.setAttribute("lang", "en");
        if (langBtnText) langBtnText.innerText = "اردو";

        elements.forEach(el => {
            if (el.getAttribute("data-en")) {
                el.innerText = el.getAttribute("data-en");
            }
        });
    }
}

// ==========================================
// 100% پائتھون ڈائریکٹ سائلنٹ پرنٹ سسٹم (Zero Flash)
// ==========================================
function sendDirectToPrinter(receiptText) {
    fetch('/direct_print', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: receiptText })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            console.log("رسید خاموشی سے پرنٹر پر بھیج دی گئی!");
        } else {
            console.error("پرنٹنگ ایرر:", data.message);
        }
    })
    .catch(error => {
        console.error("Error:", error);
    });
}

// ==========================================
// بل کا ڈیٹا تیار کر کے ڈائریکٹ پرنٹ بھیجنے کا مین فنکشن
// ==========================================
function printBillDirectly(billData) {
    let now = new Date();
    let dateStr = now.toLocaleDateString() + " " + now.toLocaleTimeString();

    let receipt = "";
    receipt += "      SMART POS SYSTEM\n";
    receipt += "   Retail & Order Specialist\n";
    receipt += "========================================\n";
    receipt += `Date: ${dateStr}\n`;
    
    if (billData && billData.customerName) {
        receipt += `Customer: ${billData.customerName}\n`;
    }
    receipt += "----------------------------------------\n";
    receipt += "Item               Qty   Price   Total\n";
    receipt += "----------------------------------------\n";

    if (billData && billData.items && billData.items.length > 0) {
        billData.items.forEach(item => {
            let name = (item.name || "Item").padEnd(17, ' ').substring(0, 17);
            let qty = String(item.qty || 1).padStart(4, ' ');
            let price = String(item.price || 0).padStart(7, ' ');
            let total = String(item.total || 0).padStart(8, ' ');
            receipt += `${name} ${qty} ${price} ${total}\n`;
        });
    } else {
        receipt += "Sample Product       1     100      100\n";
    }

    receipt += "========================================\n";
    let grandTotal = billData && billData.grandTotal ? billData.grandTotal : "100";
    receipt += `GRAND TOTAL:               Rs. ${grandTotal}\n`;
    receipt += "========================================\n";
    receipt += "      Thank You For Your Visit!\n\n\n\n";

    // ڈائریکٹ پرنٹر پر بغیر کسی ونڈو کے بھیجنا
    sendDirectToPrinter(receipt);
}