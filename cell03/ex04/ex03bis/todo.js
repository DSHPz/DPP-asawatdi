/* ==========================================================
   Mini To Do List
   - New      : กดปุ่มแล้วถามข้อความผ่าน prompt() แล้วเพิ่มไว้บนสุด
   - ลบ       : คลิกที่ TO DO แล้วยืนยันผ่าน confirm()
   - บันทึก   : เก็บรายการใน cookie และโหลดกลับมาตอนเปิดหน้าใหม่

   [jQuery] ไฟล์นี้ถูกปรับให้ใช้ jQuery แล้ว
   ส่วนที่เปลี่ยนจะมี comment ขึ้นต้นด้วย "[jQuery]" ส่วนที่ไม่มี = คงเดิม
   ========================================================== */

var COOKIE_NAME = 'ft_todos';
var COOKIE_DAYS = 365;

// [jQuery] เปลี่ยนจาก document.getElementById(...) เป็น $('#...')
// ตัวแปรเก็บเป็น jQuery object (ขึ้นต้นด้วย $ ตามธรรมเนียม)
var $list = $('#ft_list');
var $newBtn = $('#new_btn');

/* ---------- ส่วนจัดการ Cookie (คงเดิม) ---------- */

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
  // [jQuery] เปลี่ยนจาก for loop + list.children[i].textContent
  // เป็น $list.children().each(...) และ $(this).text()
  $list.children().each(function () {
    items.push($(this).text());
  });
  var json = JSON.stringify(items);
  setCookie(COOKIE_NAME, json, COOKIE_DAYS);
  // สำรองใน localStorage: Chrome ไม่เก็บ cookie เมื่อเปิดผ่าน file://
  // ถ้า cookie ใช้ไม่ได้ ข้อมูลจะยังอยู่ที่นี่ (ส่วนนี้คงเดิม)
  try { localStorage.setItem(COOKIE_NAME, json); } catch (e) {}
}

/* ---------- ส่วนจัดการ DOM ---------- */

// สร้าง div ของ TO DO หนึ่งอัน
function createTodo(text) {
  // [jQuery] เปลี่ยนจาก document.createElement + กำหนด property ทีละบรรทัด
  // เป็นการสร้าง element ด้วย $('<div>', { ... }) ในครั้งเดียว
  var $div = $('<div>', {
    'class': 'todo',
    tabindex: 0,                   // ให้โฟกัสด้วยคีย์บอร์ดได้
    role: 'button',
    title: 'คลิกเพื่อลบ'
  });
  $div.text(text);                 // [jQuery] .text() ป้องกัน HTML injection เหมือน textContent

  // [jQuery] เปลี่ยนจาก addEventListener เป็น .on()
  $div.on('click', function () { removeTodo($div); });
  // รองรับ Enter / Space เพื่อลบด้วยคีย์บอร์ด
  $div.on('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      removeTodo($div);
    }
  });
  return $div;
}

// เพิ่ม TO DO ไว้ "บนสุด" ของรายการ
function addTodo(text) {
  // [jQuery] เปลี่ยนจาก insertBefore(..., firstChild) เป็น .prepend()
  $list.prepend(createTodo(text));
}

// ลบ TO DO: ถามยืนยันก่อน แล้วลบ element ออกจาก DOM จริง ๆ (ไม่ใช่แค่ซ่อน)
function removeTodo($div) {
  // [jQuery] .text() แทน .textContent
  if (confirm('ต้องการลบรายการนี้ใช่หรือไม่?\n\n"' + $div.text() + '"')) {
    $div.remove();                 // [jQuery] .remove() แทน list.removeChild(div)
    saveList();                    // อัปเดต cookie หลังลบ
  }
}

/* ---------- ปุ่ม New ---------- */

// [jQuery] เปลี่ยนจาก newBtn.addEventListener('click', ...) เป็น .on('click', ...)
$newBtn.on('click', function () {
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
  if (!raw) {                      // ไม่มี cookie -> ลองอ่านจาก localStorage สำรอง
    try { raw = localStorage.getItem(COOKIE_NAME); } catch (e) {}
  }
  if (!raw) return;                // ไม่มีทั้งสองที่ = รายการว่าง
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

// [jQuery] เรียก loadList เมื่อ DOM พร้อม ($(function(){...}) = $(document).ready)
// หมายเหตุ: $list / $newBtn ด้านบนถูกดึงตอนโหลดไฟล์ ซึ่งปลอดภัยเพราะ script อยู่ท้าย body
$(function () {
  loadList();
});
