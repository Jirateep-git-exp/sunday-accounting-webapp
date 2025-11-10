// Canonical pocket catalog with synonyms for mapping
// Each item contains: id (slug), type, nameTh, nameEn, icon, synonyms (lowercased)

const catalog = [
  // Income
  {
    id: 'salary', type: 'income', nameTh: 'เงินเดือน', nameEn: 'Salary', icon: 'fa-solid fa-sack-dollar',
    synonyms: ['เงินเดือน', 'salary', 'ค่าจ้าง', 'เงินค่าแรง', 'เบี้ยเลี้ยง']
  },
  {
    id: 'bonus', type: 'income', nameTh: 'โบนัส', nameEn: 'Bonus', icon: 'fa-solid fa-hand-holding-dollar',
    synonyms: ['โบนัส', 'bonus']
  },
  {
    id: 'side-income', type: 'income', nameTh: 'รายได้เสริม', nameEn: 'Side income', icon: 'fa-solid fa-piggy-bank',
    synonyms: ['รายได้เสริม', 'รับจ้าง', 'freelance', 'extra income']
  },
  {
    id: 'interest', type: 'income', nameTh: 'ดอกเบี้ย', nameEn: 'Interest', icon: 'fa-solid fa-building-columns',
    synonyms: ['ดอกเบี้ย', 'interest']
  },
  {
    id: 'investment', type: 'income', nameTh: 'การลงทุน', nameEn: 'Investment', icon: 'fa-solid fa-chart-line',
    synonyms: ['ปันผล', 'เงินปันผล', 'หุ้น', 'crypto', 'ลงทุน', 'investment', 'dividend']
  },
  {
    id: 'gift-income', type: 'income', nameTh: 'ของขวัญ/ให้มา', nameEn: 'Gift', icon: 'fa-solid fa-gift',
    synonyms: ['ของขวัญ', 'ให้มา', 'gift']
  },

  // Expense
  {
    id: 'food', type: 'expense', nameTh: 'อาหาร/เครื่องดื่ม', nameEn: 'Food & Drinks', icon: 'fa-solid fa-utensils',
    synonyms: ['อาหาร', 'ข้าว', 'กิน', 'กาแฟ', 'ชา', 'น้ำ', 'food', 'drink', 'เครื่องดื่ม']
  },
  {
    id: 'groceries', type: 'expense', nameTh: 'ของใช้เข้าบ้าน', nameEn: 'Groceries', icon: 'fa-solid fa-cart-shopping',
    synonyms: ['ของใช้', 'ซื้อของเข้าบ้าน', 'ซูเปอร์', 'groceries', 'supermarket']
  },
  {
    id: 'transport', type: 'expense', nameTh: 'เดินทาง', nameEn: 'Transport', icon: 'fa-solid fa-car',
    synonyms: ['ค่าเดินทาง', 'taxi', 'รถเมล์', 'รถไฟ', 'bts', 'mrt', 'grab', 'เดินทาง', 'transport']
  },
  {
    id: 'housing', type: 'expense', nameTh: 'บ้าน/เช่า', nameEn: 'Housing/Rent', icon: 'fa-solid fa-house',
    synonyms: ['ค่าบ้าน', 'บ้าน', 'ค่าเช่า', 'เช่า', 'rent', 'คอนโด', 'หอพัก']
  },
  {
    id: 'utilities', type: 'expense', nameTh: 'ค่าน้ำ/ค่าไฟ', nameEn: 'Utilities', icon: 'fa-solid fa-plug',
    synonyms: ['ค่าน้ำ', 'ค่าไฟ', 'ไฟฟ้า', 'ประปา', 'utilities']
  },
  {
    id: 'phone-internet', type: 'expense', nameTh: 'มือถือ/อินเทอร์เน็ต', nameEn: 'Phone/Internet', icon: 'fa-solid fa-wifi',
    synonyms: ['ค่ามือถือ', 'มือถือ', 'โทรศัพท์', 'อินเทอร์เน็ต', 'เน็ต', 'wifi', 'แพ็กเกจ']
  },
  {
    id: 'health', type: 'expense', nameTh: 'สุขภาพ', nameEn: 'Health', icon: 'fa-solid fa-heart-pulse',
    synonyms: ['ค่ารักษา', 'โรงพยาบาล', 'hospital', 'ยา', 'คลินิก', 'สุขภาพ']
  },
  {
    id: 'entertainment', type: 'expense', nameTh: 'บันเทิง', nameEn: 'Entertainment', icon: 'fa-solid fa-film',
    synonyms: ['หนัง', 'netflix', 'spotify', 'เกม', 'บันเทิง', 'cinema', 'subscription']
  },
  {
    id: 'shopping', type: 'expense', nameTh: 'ช้อปปิ้ง', nameEn: 'Shopping', icon: 'fa-solid fa-bag-shopping',
    synonyms: ['ซื้อของ', 'ช้อปปิ้ง', 'lazada', 'shopee', 'shopping', 'shop']
  },
  {
    id: 'education', type: 'expense', nameTh: 'การศึกษา', nameEn: 'Education', icon: 'fa-solid fa-graduation-cap',
    synonyms: ['เรียน', 'คอร์ส', 'หนังสือ', 'education', 'course']
  },
  {
    id: 'travel', type: 'expense', nameTh: 'ท่องเที่ยว', nameEn: 'Travel', icon: 'fa-solid fa-plane',
    synonyms: ['เที่ยว', 'ทริป', 'โรงแรม', 'ตั๋วเครื่องบิน', 'travel', 'hotel', 'flight']
  },
  {
    id: 'pets', type: 'expense', nameTh: 'สัตว์เลี้ยง', nameEn: 'Pets', icon: 'fa-solid fa-paw',
    synonyms: ['สัตว์เลี้ยง', 'อาหารแมว', 'อาหารหมา', 'อาบน้ำตัดขน', 'pets']
  },
  {
    id: 'fees', type: 'expense', nameTh: 'ค่าธรรมเนียม/ภาษี', nameEn: 'Fees/Tax', icon: 'fa-solid fa-receipt',
    synonyms: ['ค่าธรรมเนียม', 'ค่าปรับ', 'ภาษี', 'fee', 'tax']
  },
  {
    id: 'charity', type: 'expense', nameTh: 'ทำบุญ/บริจาค', nameEn: 'Charity', icon: 'fa-solid fa-hand-holding-heart',
    synonyms: ['ทำบุญ', 'บริจาค', 'donate', 'charity']
  },
  {
    id: 'debt', type: 'expense', nameTh: 'หนี้สิน/ผ่อน', nameEn: 'Debt/Installment', icon: 'fa-solid fa-money-check-dollar',
    synonyms: ['หนี้', 'ผ่อน', 'installment', 'บัตรเครดิต']
  },
  {
    id: 'savings', type: 'expense', nameTh: 'ออมเงิน', nameEn: 'Savings', icon: 'fa-solid fa-piggy-bank',
    synonyms: ['ออม', 'เก็บเงิน', 'ฝาก', 'savings']
  },
  {
    id: 'others', type: 'expense', nameTh: 'อื่นๆ', nameEn: 'Others', icon: 'fa-solid fa-ellipsis',
    synonyms: ['อื่นๆ', 'other', 'misc']
  }
]

module.exports = catalog
