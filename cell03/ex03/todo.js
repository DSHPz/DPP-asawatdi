/* ==========================================================
   Mini To Do List
   - New      : กดปุ่มแล้วถามข้อความผ่าน prompt() แล้วเพิ่มไว้บนสุด
   - ลบ       : คลิกที่ TO DO แล้วยืนยันผ่าน confirm()
   - บันทึก   : เก็บรายการใน cookie และโหลดกลับมาตอนเปิดหน้าใหม่
   ========================================================== */

var COOKIE_NAME = 'ft_todos';
var COOKIE_DAYS = 365;

var list = document.getElementById('ft_list');
var newBtn = document.getElementById('new_btn');

/* ---------- ส่วนจัดการ Cookie ---------- */

// เขียน cookie (เข้ารหัสด้วย encodeURIComponent เพราะมีภาษาไทย/อักขระพิเศษ)
function setCookie(name, value, days) {
  var expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = name + '=' + encodeURIComponent(value) +
                    '; expires=' + expires + '; path=/; SameSite=Lax';
}

// อ่าน cookie ตามชื่อ ถ้าไม่มีให้คืน null
function getCookie(name) {
  var parts = document.cookie.split('; ');
  for (var i = 0; i < parts.length; i++) {
    var idx = parts[i].indexOf('=');
    if (parts[i].slice(0, idx) === name) {
      return decodeURIComponent(parts[i].slice(idx + 1));
    }
  }
  return null;
}

// อ่านข้อความจาก DOM ทุก TO DO (เรียงจากบนลงล่าง) แล้วบันทึกเป็น JSON ใน cookie
// ใช้ DOM เป็นแหล่งข้อมูลหลัก จึงไม่ต้องดูแล array แยกอีกชุด
function saveList() {
  var items = [];
  for (var i = 0; i < list.children.length; i++) {
    items.push(list.children[i].textContent);
  }
  setCookie(COOKIE_NAME, JSON.stringify(items), COOKIE_DAYS);
}

/* ---------- ส่วนจัดการ DOM ---------- */

// สร้าง div ของ TO DO หนึ่งอัน
function createTodo(text) {
  var div = document.createElement('div');
  div.className = 'todo';
  div.textContent = text;          // textContent ป้องกัน HTML injection
  div.tabIndex = 0;                // ให้โฟกัสด้วยคีย์บอร์ดได้
  div.setAttribute('role', 'button');
  div.title = 'คลิกเพื่อลบ';

  div.addEventListener('click', function () { removeTodo(div); });
  // รองรับ Enter / Space เพื่อลบด้วยคีย์บอร์ด
  div.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      removeTodo(div);
    }
  });
  return div;
}

// เพิ่ม TO DO ไว้ "บนสุด" ของรายการ
function addTodo(text) {
  list.insertBefore(createTodo(text), list.firstChild);
}

// ลบ TO DO: ถามยืนยันก่อน แล้วลบ element ออกจาก DOM จริง ๆ (ไม่ใช่แค่ซ่อน)
function removeTodo(div) {
  if (confirm('ต้องการลบรายการนี้ใช่หรือไม่?\n\n"' + div.textContent + '"')) {
    list.removeChild(div);
    saveList();                    // อัปเดต cookie หลังลบ
  }
}

/* ---------- ปุ่ม New ---------- */

newBtn.addEventListener('click', function () {
  var text = prompt('ใส่ TO DO ใหม่:');
  // prompt คืน null ถ้ากด Cancel; ตัดช่องว่างหัวท้าย แล้วต้องไม่ว่างจึงจะเพิ่ม
  if (text !== null && text.trim() !== '') {
    addTodo(text.trim());
    saveList();                    // บันทึกลง cookie ทุกครั้งที่เพิ่ม
  }
});

/* ---------- โหลดรายการจาก cookie ตอนเปิดหน้า ---------- */

function loadList() {
  var raw = getCookie(COOKIE_NAME);
  if (!raw) return;                // ไม่มี cookie = รายการว่าง
  try {
    var items = JSON.parse(raw);   // items[0] คือรายการบนสุด
    // วนจากท้ายไปหน้า เพราะ addTodo ใส่ไว้บนสุดทุกครั้ง ลำดับจึงตรงกับที่บันทึกไว้
    for (var i = items.length - 1; i >= 0; i--) {
      addTodo(items[i]);
    }
  } catch (e) {
    // cookie เสียหาย: ข้าม แล้วเริ่มด้วยรายการว่าง
  }
}

loadList();
