// const { stringify } = require("querystring");

// 全局变量
let Form = [];
let FormStorage = [];

let taskCount = 1;  // 当前保有的任务总数，也是Form对应任务的最大下标+1
let busyCount = 0;

function $(id) {
    return document.getElementById(id);
}

window.onload = function() {
  // 读取当前的Form
  FormStorage = JSON.parse(localStorage.getItem("k_ToDoListForm"));
  if(FormStorage) {
    for(let item of FormStorage) {
      let itemObj = JSON.parse(item);
      Form.push(itemObj);
    }
  }
  reload();
  

    $('add-todo-item').onclick = submitTask;
    $('btn-clear-all').onclick = clearAll;
    $('btn-clear-done').onclick = clearDone;
};

// 提交task
function submitTask() {
    //获得提交的信息
    let userInput = $('new-todo-item').value;
    let date = $('new-todo-date').value;
    console.log(date);
    let year = parseInt(date.substring(0, 4));
    let month = parseInt(date.substring(5, 7));
    let day = parseInt(date.substring(8, 10));
    
    if(userInput == '' || !year) {
      alert('输入不能空白。');
    } else {
        //生成一个新的Item到Form中
      // let item = {
      //   count: taskCount,
      //   content: userInput,
      //   isCompleted: false
      // };
      let item = new Item(taskCount, userInput, year, month, day);
      Form.push(item);
      taskCount++;
      //刷新页面（刷新页面逻辑：根据Form的内容修改展示的Card）
      reload();
    }
    $('new-todo-item').value = '';
}


// 清空列表
function clearAll() {
    // 将Form清空
    // 刷新页面
    Form = [];
    taskCount = 0;
    reload();
}
// 清除已完成事项
function clearDone() {
    //将Form中已完成的种类删除
    //刷新页面
    let copy = [];
    let copyCount = 0;
    for (let item of Form) {
      if(!item.isCompleted) {
        let copyItem = item;
        copyItem.count = copyCount;
        copyCount++;
        copy.push(copyItem);
      }
    }
    Form = copy;
    taskCount = copyCount;
    reload();
}


function reload() {
  let topCount = 0;
  for (let item of Form) {
    if(!item.isCompleted && lessThanToday(item.ddlYear, item.ddlMonth, item.ddlDay)) {
      item.isOutDDL = true;
    }
  }

  // 四种：置顶（离ddl最近的没有outddl没有complete的），没有outddl没有complete， outddl， complete
    reorder();
    if(Form[0].isOutDDL || Form[0].isCompleted) {
      topCount = -1;
    }

    $('listContainer').innerHTML = '';
    for (let item of Form) {
      createTaskCard(item, topCount); // 第0个Task置顶
    }
    $('count').innerHTML = '当前总共有' + busyCount + '个未完成的任务';

    //存储Form到LocalStorage
    FormStorage = [];
    for(let item of Form) {
      let itemString = JSON.stringify(item);
      FormStorage.push(itemString);
    }
    localStorage.setItem("k_ToDoListForm", JSON.stringify(FormStorage));
    
}

function lessThanToday(year, month, day) {
  let today = new Date();
  let today_year = today.getFullYear();
  let today_month = today.getMonth() + 1;
  let today_day = today.getDate();
  if(today_year > year) {
    return true;
  } else if(today_year == year && today_month > month) {
    return true;
  } else if(today_year == year && today_month == month && today_day > day) {
    return true;
  }
  return false;
}


// 更新过程中对Form中Task的顺序进行更新，按照 最急迫-未完成-超时-已完成 的顺序
function reorder() {
  busyCount = 0;

  let copyNormal = [];
  let copyOutDDL = [];
  let copyComplete = [];
  let copyCount = 0;

  // 未完成任务的顺序要按照离截止日期的距离来排列
  for (let item of Form) {
    if(!item.isCompleted && !item.isOutDDL){
      let copyItem = item;
      // copyItem.count = copyCount;
      copyCount++;
      busyCount++;
      copyNormal.push(copyItem);
    }
  }
  for (let item of Form) {
    if(item.isOutDDL){
      let copyItem = item;
      copyItem.count = copyCount;
      copyCount++;
      copyOutDDL.push(copyItem);
      busyCount++;
    }
  }
  for (let item of Form) {
    if(item.isCompleted){
      let copyItem = item;
      copyItem.count = copyCount;
      copyCount++;
      copyComplete.push(copyItem);
    }
  }

  copyNormal.sort(function(item1, item2){
    let year1 = item1.ddlYear;
    let month1 = item1.ddlMonth;
    let day1 = item1.ddlDay;
    let year2 = item2.ddlYear;
    let month2 = item2.ddlMonth;
    let day2 = item2.ddlDay;
    if(year2 > year1) {
      return -1;
    } else if(year1 == year2 && month2 > month1) {
      return -1;
    } else if(year1 == year2 && month2 == month1 && day2 > day1) {
      return -1;
    }
    if(year1 == year2 && month2 == month1 && day2 == day1) {
      return 0;
    }
    return 1;
    // return 2-1 升序：2比1大，结果为true；2比1小，结果为false
  });

  for(let i=0; i<copyNormal.length; i++) {
    copyNormal[i].count = i; 
  }

  copyNormal.push.apply(copyNormal, copyOutDDL);
  copyNormal.push.apply(copyNormal, copyComplete);
  // let copy = copy.concat(copyComplete);
  // 接下来把normal按照离ddl的时间大小排序（ddl越小越在前，升序）


  // // 这里是置顶逻辑
  // let i=0;
  // for(i=0; i<Form.length; i++) {
  //   if(!Form[i].isCompleted) {
  //     let copyItem = Form[i];
  //     copyItem.count = copyCount;
  //     copy.push(copyItem);
  //     copyCount++;
  //     break;
  //   }
  // }
  // Form.splice(i,1);

  

  Form = copyNormal;
}

// function compareDDL() {
//   return function(item1, item2){
//     let year1 = item1.ddlYear;
//     let month1 = item1.ddlMonth;
//     let day1 = item1.ddlDay;
//     let year2 = item2.ddlYear;
//     let month2 = item2.ddlMonth;
//     let day2 = item2.ddlDay;

//     if(year2 > year1) {
//       return 1;
//     } else if(year1 == year2 && month2 > month1) {
//       return 1;
//     } else if(year1 == year2 && month2 == month1 && day2 > day1) {
//       return 1;
//     }
//     if(year1 == year2 && month2 == month1 && day2 == day1) {
//       return 0;
//     }
//     return -1;

//     // return 2-1 升序：2比1大，结果为true；2比1小，结果为false
//   }
// }

function createTaskCard(item, topCount) {
    let card = document.createElement('li');
    let container = document.createElement('div');
    container.className = 'item-container';
    if(item.isCompleted) {
      container.className += ' complish';
    }
    if(item.count == topCount) {
      container.className += ' moveToTop';
    }
    if(item.isOutDDL) {
      container.className += ' outDDL';
    }
    card.appendChild(container);

    // 删除单个task
    let deleteBtn = document.createElement('input');
    deleteBtn.className = 'delete';
    deleteBtn.type = 'button';
    deleteBtn.value = '删除';
    deleteBtn.onclick = (function() {
      return function (){
        deleteTask(item.count);
      }  
    })(item.count);
    container.appendChild(deleteBtn);

    $('listContainer').appendChild(card);

    let ddl = document.createElement('span');
    ddl.className = 'item-ddl';
    ddl.innerHTML = 'DDL' + item.ddlYear + '-' + item.ddlMonth + '-' + item.ddlDay;
    container.appendChild(ddl);


    let content = document.createElement('span');
    content.className = 'item-content';
    content.innerText = item.content;
    container.appendChild(content);

    // 改变task执行状态
    let editBtn = document.createElement('input');
    editBtn.className = 'edit';
    editBtn.type = 'button';
    editBtn.value = '点击翻转';
    editBtn.onclick = (function() {
      return function (){
        editTask(item.count);
      }  
    })(item.count);
    container.appendChild(editBtn);
    
    
}

function editTask(taskCount) {
  Form[taskCount].isCompleted = !Form[taskCount].isCompleted;
  if(Form[taskCount].isOutDDL) {
    Form[taskCount].isOutDDL = false;
  }
  reload();
}

function deleteTask(count) {
  let removed = Form.splice(count, 1);
  taskCount--;
  reload();
}



// $('#formToDo').onsubmit = function(e) {
//     e.preventDefault();
//     let userInput = $('#new-todo-item').val();

//     let item = document.createElement('li');
//     let container = document.createElement('div');
//     container.className = 'item-container';
//     item.appendChild(container);

//     let content = document.createElement('h5');
//     content.className = 'item-content';
//     container.appendChild(content);

//     let editBtn = document.createElement('input');
//     editBtn.className = 'edit';
//     editBtn.type = 'button';
//     editBtn.value = 'edit';
//     container.appendChild(editBtn);
//     let deleteBtn = document.createElement('input');
//     deleteBtn.className = 'delete';
//     deleteBtn.type = 'button';
//     deleteBtn.value = 'edit';
//     container.appendChild(deleteBtn);


//     // $("#listContainer").append("<li>"+ userInput + '<input type="button" class="edit" value="Edit">'+ '<input type="button" class=" delete" value="Delete">'+"</li>" );
//     $('#new-todo-item').innerText = '';
//     updateListCount();
// }

// function updateListCount(){
//   var count= document.querySelectorAll('li').length;
//   $("h3").innerText = "You have " + count + " task(s) left!");
// }

// //make delete button remove list item

// $('#listContainer').on('click', '.delete',function(){
//     $(this).parent().remove();
//     updateListCount();
// });
// //clear all items in list
// $( "#clearBtn" ).click(function() {
//   $( "li" ).remove();
// });

// //mark list items as markComplete
// $(document).ready(function(){
//   $("ul").on("click" ,"li", function (){
//    $(this).toggleClass("markComplete");

// })
//   //hover that will show and hide appended buttons
// $("ul").on("mouseleave" ,"li", function (){
//     $(".delete, .edit").hide();
//     $(".delete, .edit").addClass("new");
// });


// $("ul").on("mouseenter" ,"li", function (){
//     $(".delete, .edit").show();
//     $(".delete, .edit").addClass("new");
// });

// });

// //clear the items with new class--that is mark completed
// $( "#clearDone" ).click(function() {
//   $( "li.markComplete" ).remove();
//   updateListCount();
// });

// //EDIT TASK
// //user clicks on edit button
// $(document).on("click", '.edit', function () {
//     // make the span editable and focus it
//       $(this).parent().prop("contenteditable", true).focus();
//     return false;
//   });

