function switchLeaderboard(index) {
  const leaderboards = document.querySelectorAll('.leaderboard');
  leaderboards.forEach((board, i) => {
    board.classList.toggle('active', i === index);
  });
}

function sandwichToJson(biscuit) {
  // 解析自定义的紧实数据类型（字典，奇数行是float键，偶数行是string值，没有分隔符）
  const lines = biscuit.split('\n');
  const result = {};
  for (let i = 0; i < lines.length; i += 2) {
    key = parseFloat(lines[i]);
    if (key.toFixed(1).length < lines[i].length)
    {
      console.log(`Data Error: Line ${i+1} Key${lines[i]}`);
      alert(`Data Error: Line ${i+1} Key ${lines[i]} 请截图联系麦花`);
      return result;
    }
    result[key] = lines[i + 1];
  }
  return result;
}

function encoder(array, no_convert = false) {
  const byteArray = new Uint8Array(array);
  var result = [];
  var index = 0;
  for (let i = 0; i < byteArray.length; i++, index++) {
      // 将其中的,,替换成,[],（节省传输字节）
      if (result[index - 1] == 44 && (byteArray[i] ^ 0x1F) == 44) {
          result.push(91);
          result.push(93);
          index += 2;
      }
      result.push(byteArray[i] ^ 0x1F);
  }
  if (no_convert) return result;
  const processedArray = new Uint8Array(result);
  return new TextDecoder('utf-8').decode(processedArray);
}

function unzip(data, index = null, total = null, isJson = true, no_encode = false) {
  if (typeof JSZip === "undefined") { // JSZip未加载
      return data;
  }
  const zip = new JSZip();  
  return zip.loadAsync(data) // ArrayBuffer
    .then(zip => {  
        const files = Object.keys(zip.files);  
        const file = files[0];  
        return zip.file(file).async('arraybuffer');  
    })  
    .then(data => {  
        if (index != null) {
          document.querySelector("#info").innerHTML += `Data #${index}/${total} Finished !!<br>`;
        }
        if (!no_encode) data = encoder(data);
        else data = new TextDecoder('utf-8').decode(new Uint8Array(data));
        if (isJson) {
          return JSON.parse(data);  
        } else {
          return data;  
        }
    });  
}

async function fetchBinAndUnzip(src_url, backupUrl, index, total, isJson = true, no_encode = false) {  
  return await fetch(src_url)  
    .then(response => {
        if (!response.ok) {
            throw new Error(`Connection Error: ${response.status} ${response.statusText}`);
        }
        return response.arrayBuffer();
    })  
    .then(data => {  
      return unzip(data, index, total, isJson, no_encode);
    })  
    .catch(error => {  
        if (backupUrl) {
            return fetchBinAndUnzip(backupUrl, null, index, total, isJson);
        } else {
            console.error(error);
            return undefined;
        }
    });  
}

const rankDataUrl = "assets/js/member_info_top_rate.js";  
const rankDataBackupUrl = "assets/js/member_info_top_rate_screen.js";  
const rankNameUrl = "assets/js/member_info_top_name.js";  
const groupsUrl = "assets/groups.bin.zip";  
const booksUrl = "assets/books.bin.zip";  
const blacklistUrl = "assets/black_list_string.bin.zip";  
const warning = '<div style="color:black;">本站数据为王者班长自行收集，与百词斩官方无关<br>不提供真实性or时效性保证，请以官方页面数据为准</div>';

let url = '';
let initFinished = false;

let groups = null;
let books = null;
var streakRank = null, expectacyRank = null, wordRank = null, timeRank = null;
let blacklistStrings = null;
var blackListData = null, groupsData = null, booksData = null, rankData = null, rankNamesData = null, JSZipPromise = null;
async function init() {  
    url = window.location.href;
    url = url.substring(0, url.lastIndexOf("Examiner") + 9);
    groupsData = fetchBinAndUnzip(url + groupsUrl, null, 2, 4, false);
    blackListData = fetchBinAndUnzip(url + blacklistUrl, null, 3, 4, false);
    // booksData = fetchBinAndUnzip(url + booksUrl, null, 4, 4, false);

    JSZipPromise = loadJSZip();
}
async function loadJSZip() {
  src_url = url + "assets/js/jszip.min.js"
    try {
      data = await fetchBinAndUnzip(src_url, null, null, false, no_encode = true);
      data = new TextDecoder('utf-8').decode(new Uint8Array(data)); // 此时没有JSZip，不会被解压，但要手动编码
      if (typeof data === "undefined") {
        throw new Error("JSZip not found");
      }
    } catch (error) {
      alert("FAIL to fetch JSZip ! Refresh the page or change the browser.");
      return;
    }
    eval(data);
}
async function init2() {// 在DOM加载完成后的初始化
    document.querySelector("#query").disabled = false;
    document.querySelector("#query").placeholder = "请输入用户的BczID";
    document.querySelector("#info").innerHTML += warning + "<br>数据构建中...";
    document.querySelector("#query").addEventListener("keyup", function(event) {
      if (event.keyCode === 13) {
        event.preventDefault();
        document.getElementById("query-btn").click();
      }
    });
    if (typeof rank === "undefined") {
        alert("JS排名数据加载失败，请刷新页面或更换浏览器");
    }
    streakScreenCount = rank[0].shift();
    streakRank = rank[0];

    expectacyScreenCount = rank[1].shift();
    expectacyRank = rank[1];

    wordScreenCount = rank[2].shift();
    wordRank = rank[2];

    timeScreenCount = rank[3].shift();
    timeRank = rank[3];

    blacklistScreenCount = rank[4].shift();
    blacklistRank = rank[4];

    rankNames = sandwichToJson(rankNames);
  
    loadLeaderboardData(0, streakRank, streakScreenCount, rankNames);
    loadLeaderboardData(1, expectacyRank, expectacyScreenCount, rankNames);
    loadLeaderboardData(2, wordRank, wordScreenCount, rankNames);
    loadLeaderboardData(3, timeRank, timeScreenCount, rankNames);
    loadLeaderboardData(4, blacklistRank, blacklistScreenCount, rankNames);
    
    console.log("streakScreenCount", streakScreenCount);

    if (streakScreenCount > 0) {
      document.querySelector("#leaderboard-container").style.display = "none";
    }

    // 提高页面加载速度，先加载排名，再加载用户信息
    [groups, blacklistStrings] = await Promise.all([groupsData, blackListData]);
    books = ""; // 图书数据暂时不用
    if (typeof groups === "undefined" || typeof blacklistStrings === "undefined") {
        document.querySelector("#info").innerHTML += "Loading Failed! Refresh the page or change the browser.";
        return;
    }
    if (typeof JSZip === "undefined") {
        await JSZipPromise;
    }
    if (typeof groups.byteLength !== "undefined") {
      groups = await unzip(groups, 3, 5, false);
    }
    if (typeof blacklistStrings.byteLength !== "undefined") {
      blacklistStrings = await unzip(blacklistStrings, 4, 5, false);
    }
    if (typeof books.byteLength !== "undefined") {
      books = await unzip(books, 5, 5, false);
    }
    groups = sandwichToJson(groups);
    books = sandwichToJson(books);
    blacklistStrings = sandwichToJson(blacklistStrings);
    initFinished = true;
    document.querySelector("#info").innerHTML = groups[-1] + warning + "<br>构建完成";
}
init();
window.onload = function() {  
    init2().catch(console.error);
    document.querySelector("#query").focus();

    const mobileControls = document.querySelector(".mobile-controls");
    const leaderboards = document.querySelectorAll(".leaderboard");
    leaderboards.forEach((board, i) => {
      const button = document.createElement("button");
      button.innerText = board.querySelector("h2").innerText;
      button.onclick = () => switchLeaderboard(i);
      mobileControls.appendChild(button);
    });
}

function loadLeaderboardData(leaderboardId, uid_list, screenCount, rankNames) {
  const tbody = document.getElementById(`list-${leaderboardId}`);
  tbody.innerHTML = "";
  var ranking = 1;
  var previous_score = uid_list[1];
  for (let i = 0; i < uid_list.length; i+=2) {
    const uid = uid_list[i];
    const name = rankNames[(uid * 10 % 10000000 / 10)];
    var score = uid_list[i + 1];
    if (score !== previous_score) {
      ranking += 1;
      previous_score = score;
    }
    if (leaderboardId === 3){
      score = seconds_to_time(score, false, false);
    }
    const tr = document.createElement("tr");
    if (i < screenCount * 2) {
      tr.innerHTML = `<td>[${ranking}]**${uid}</td><td>${name}</td><td>${score}</td>`;
    } else {
      tr.innerHTML = `<td>[${ranking}]${uid}</td><td>${name}</td><td>${score}</td>`;
    }
    tbody.appendChild(tr);
  }
}


const sect_num = 3;
let fullNames = {};
let fullInfos = {};
function date_str(date_num, only_date = false) {
  var date = new Date(date_num );
  if (only_date)
    return date.toLocaleDateString();
  return date.toLocaleString();
}
function seconds_to_time(seconds, no_seconds = false, no_plus_four = false) {
  var h = Math.floor(seconds / 3600);
  if (!no_plus_four)
    h += 4;
  if (h >= 24) h -= 24;
  var m = Math.floor((seconds % 3600) / 60);
  if (no_seconds)
    return `${h}:${m < 10 ? '0' + m : m}`;
  var s = Math.floor(seconds % 60);
  return `${h}:${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
}
function clear_query_result() {
  document.querySelector("#query-result").innerHTML = "";
  if (streakScreenCount === 0) {
    document.querySelector("#leaderboard-container").style.display = "flex";
  }
}
async function loadCanvasJS() {
  src_url = url + "assets/js/canvasjs.min.zip"
    try {
      data = await fetchBinAndUnzip(src_url, null, null, null, false, no_encode = true);
      if (typeof data === "undefined") {
        throw new Error("undefined");
      }
    } catch (error) {
      document.querySelector("#query-result").innerHTML += "FAIL to fetch canvasJS ! Refresh the page or change the browser.";
      return;
    }
    eval(data);
}
async function drawBarChart(data_dict, x_scale, y_scale, is_time, element) {
  if (typeof CanvasJS === "undefined") {
    await loadCanvasJS();
  }
  data_list = [];
  var x, y, max_key=0, min_key=-2;//固定最小值为-2，以显示-2到-1的柱子
  Object.keys(data_dict).forEach(key => {
    key = parseInt(key);
    if (key > max_key) {
      max_key = key;
    }
    x = key * x_scale;
    y = data_dict[key] * y_scale;
    if (is_time) {
      label = `${seconds_to_time(x, true)}-${seconds_to_time((x + x_scale) , true)}`;
    } else {
      label = `${x}-${x + x_scale}`;
    }
    data_list.push({
      label: label,
      x: x,
      y: y,
      indexLabel: y.toFixed(0),
    });
  });
  // 如果最大的key还不够40，则补齐到40
  if (max_key - min_key < 40) {
    max_key = min_key + 40;
  }
  // 加入2个额外的key，用于显示第一个和最后一个柱子（0值）
  data_list.push({
    x: (min_key - 1) * x_scale,
    y: 0,
  });
  data_list.push({
    x: (max_key + 2) * x_scale,
    y: 0,
  }); // 要多一个相邻的，让canvasJS识别到最小单位，不然柱子就会变得老大一条
  data_list.push({
    x: (max_key + 1) * x_scale,
    y: 0,
  });
  
  var target_width = (max_key - min_key + 1) * 15;
  element.innerHTML = `<div class="ch"></div>`;
  element_div = element.querySelector(".ch");
  element_div.style.width = `${target_width}px`;
  const chart = new CanvasJS.Chart(element_div, {
    axisX: {
      minimum: min_key * x_scale,
      maximum: (max_key + 1) * x_scale,
      labelFormatter: function(e) {
        if (is_time) {
          return seconds_to_time(e.value , true);
        } else {
          return e.value;
        }
      }
    },
    animationEnabled: true,
    theme: "light2",
    title: {
      text: ""
    },
    data: [{
      type: "column",
      dataPoints: data_list,
      barThickness: x_scale,
    }]
  });
  chart.render();
}
function group_cat(user_groups) {
  var result = "";
  Object.keys(user_groups).forEach(group_id => {
    group = user_groups[group_id];
    if (streakScreenCount > 0)
      result += `${groups[group_id]} 满卡 ${group.group_max_streak} (${group.group_max_completed_times}/${group.group_max_duration_days})<br>`;
    else
      result += `[${group_id}] ${groups[group_id]} 满卡 ${group.group_max_streak} (${group.group_max_completed_times}/${group.group_max_duration_days})<br>`;
  });
  return result;
}
function blacklist_cat(blacklist_info) {
  if (blacklist_info.length == 0) {
    return "无";
  }
  var result = "<div class='blacklist-item'><table><tr><th>日期</th><th>原因</th><th>记录人</th><th>备注</th><th>最后编辑时间</th><th>最后编辑人</th><th>首次编辑人</th></tr>";
  for (var info of blacklist_info) {
    // [date, reason, recorder, remark, last_edit_time, last_editor, first_editor]
    var tmp = "";
    for (var hash of info[1]) {
      tmp += blacklistStrings[hash] + ",";
    }
    result += `<tr>
        <td>${date_str(info[0], true)}</td>
        <td>${tmp}</td>
        <td>${blacklistStrings[info[2]]}</td>
        <td>${blacklistStrings[info[3]]}</td>
        <td>${date_str(info[4])}</td>
        <td>${blacklistStrings[info[5]]}</td>
        <td>${blacklistStrings[info[6]]}</td>
      </tr>`;
    }
  result += "</table></div>";
  return result;
}
const rankPresets = {
  "streak": [
// 根据不同的满卡天数档次，生成对应的满卡描述。第一档：紫色；第二档：橙色；第三档：金黄色；第四档：绿色；第五档：天蓝色；第六档：深蓝色；第七档：灰色；第八档：黑色
    [1550,520,365,100,60,30,14,0],["8B008B","ef6c00","ffb300","6ce06c","00acc1","1A237E","707070","000000"],["与斩同寿","烂柯词痴","春秋词梦","百尺竿头","月旦雅词","可圈可点","初窥门径","籍籍无名"]
  ],
  "reputation": [// 颜色要反过来，从黑色开始，到紫色结束
    [100,60,0,-60,-120,-180,-360,-2147483647],["00acc1","6ce06c","ffb300","707070","000000","000000","000000","000000"],["乖宝宝","叛逆期","自我放逐","有理有据","天赋异禀","渐入佳境","孤独求败","退班战神"]
  ],
  "word": [
    [1000,500,240,80,50,15,0,-2147483647],["8B008B","ef6c00","ffb300","6ce06c","00acc1","1A237E","707070","000000"],["词海行舟","词山问道","心无旁骛","勤学苦练","勤学苦练","启程","冒泡","潜水"]
  ],
  "time": [//从4点开始的秒数。4-7点第一档，7-9第二档，9-13第三档，13-18第四档，18-22第五档，22-4第六档
    [86340,64800,50400,32400,18000,10800,0],["707070","1A237E","00acc1","6ce06c","ffb300","ef6c00","8B008B"],["数据不足","猫头鹰","晚卡","下午卡","中午卡","清晨花鹿","紫气东来"]
  ]
}
function fancyRankBox(title, rank, rank_data, presetName="streak") { // 生成好看的排行榜盒子
  preset = rankPresets[presetName];
  var rank_index = preset[0].findIndex(x => x <= rank_data);
  var color = preset[1];
  // 背景颜色半透明
  var textColor = '#' + preset[1][rank_index], backgroundColor = '#' + preset[1][rank_index] + '55';
  var comment = preset[2][rank_index];
  return `<div class="rank-box" style="background-color:${backgroundColor};color:${textColor};">
      <p></p><h4>${title}</h4>
      <h3><strong>${rank}</strong></h3>
      ${comment}</div>`;
}
async function queryInfos() {
  if (!initFinished) {
    alert("数据构建中，请稍后再试");
    return;
  }
  const uid = document.querySelector("#query").value;
  if (uid === "") {
    alert("Please enter a valid BczID");
    return;
  }

  const queryButton = document.querySelector("#query-btn");
  const queryResult = document.querySelector("#query-result");
  const queryInput = document.querySelector("#query");

  queryInput.disabled = true;
  queryButton.innerText = "Searching...";

  [user_name, user_infos] = await Promise.all([queryFullNames(uid), queryFullInfos(uid)]);
  fetched_sections[`${uid}`.slice(0, 3)] = 1; 

  if (!user_infos) {
    queryInput.disabled = false;
    queryButton.innerText = "Search";
    queryResult.innerHTML = `<div class="error-message"><p>User ${uid} not found ʕ⊙ᴥ⊙ʔ</p><p>只有7天内打过卡且加入榜上班级的宝宝才会出现在这里。</p></div><button class="btn-return" onclick="clear_query_result()">返回</button>`;
    return;
  }

  var user_info_html = `<div class="user-info-container">
  <div class="user-basic-info"><h2>${user_name}</h2>
    <p><strong>BczID:</strong> ${uid}<button class="btn-return" onclick="clear_query_result()">返回</button></p>
    <p style="color:gray;">${groups[-1]}</p>
  </div>`;
  if (streakScreenCount > 0 && user_name.length > 0) {
    queryResult.innerHTML = user_info_html;
    queryInput.disabled = false;
    queryButton.innerText = "Search";
    alert(`Invalid streak screen count implemented: ${user_name}`);
    throw new Error (`Invalid streak screen count implemented: ${user_name}`);
  }
  user_info_html += `
  <div class="user-rank-info"><!-- <h3>排行榜数据</h3> -->
      <div class="rank-box-container">
${fancyRankBox('满卡天数', user_infos.max_streak, user_infos.max_streak, "streak")}
${fancyRankBox('近满卡天数', user_infos.max_expectancy, user_infos.max_expectancy, "streak")}
${fancyRankBox('7天平均词数', user_infos.word_average, user_infos.word_average, "word")}
${fancyRankBox('早卡榜排名', user_infos.time_rank, user_infos.c_time_average, "time")}
${fancyRankBox('信誉评分', user_infos.reputation, user_infos.reputation, "reputation")}
      </div>
  </div>
  <div class="user-additional-info"><h3>黑名单信息</h3><p>${blacklist_cat(user_infos.blacklist_info)}</div>`;
  queryInput.disabled = false;
  queryButton.innerText = "Search";
  document.querySelector("#leaderboard-container").style.display = "none";

  if (streakScreenCount == 0) {
    queryResult.innerHTML = `${user_info_html}<div class="user-additional-info"><h3>详细数据</h3>
      <!-- <p><strong>满卡榜排名:</strong> ${user_infos.streak_rank}</p>
      <p><strong>接近满卡榜排名:</strong> ${user_infos.expectancy_rank}</p>
      <p><strong>7天平均词数榜排名:</strong> ${user_infos.word_rank}</p> -->
      <p><strong>平均打卡时间:</strong> ${seconds_to_time(user_infos.c_time_average)}</p>
      <p><strong>标准差:</strong> ${seconds_to_time(user_infos.completed_time_average-user_infos.c_time_average, false, true)}</p>
      <p><strong>加入过班级:</strong> ${group_cat(user_infos.user_groups)}</p>
      <!-- <p><strong>学过书籍:</strong> ${user_infos.books_name}</p> -->
    </div>
    
    <div class="user-graph-info"><h3>分布数据</h3>
      <div><strong>词数分布:</strong><div id="graph-word" class="graph-container"></div></div><br>
      <div><strong>打卡时间分布:</strong><div id="graph-completed" class="graph-container"></div></div>
    </div><button class="btn-return" onclick="clear_query_result()">返回</button>
  </div>`;
    await drawBarChart(user_infos.word_dict, 25, 1, false, document.querySelector("#graph-word"));
    await drawBarChart(user_infos.completed_times_dict, 1800, 1, true, document.querySelector("#graph-completed"));
  } else {
    queryResult.innerHTML = `${user_info_html}</div>`;
  }
}
let fetched_sections = {};
async function queryFullNames(uid) {
  if (typeof fullNames[uid] !== "undefined") {
    return fullNames[uid];
  }
  var sect = `${uid}`.slice(0, 3);
  if (typeof fetched_sections[sect] === "undefined"){
    var query_url = url + "assets/member_name/" + sect + ".bin.zip";
    var data = null;

    try {
      data = await fetchBinAndUnzip(query_url, null, null, null, false);
    } catch (error) {
      document.querySelector("#query-result").innerHTML += "Data loading failed! Please refresh the page or change the browser.";
      console.error(error);
      return;
    }
    data_dict = sandwichToJson(data);
    Object.keys(data_dict).forEach(key => {
      fullNames[key] = data_dict[key];
    });
  }
  if (uid in fullNames)
    return fullNames[uid];
  else{
    fullNames[uid] = null;
    return null;
  }
}
async function queryFullInfos(uid) {
  if (typeof fullInfos[uid] !== "undefined") {
    return fullInfos[uid];
  }
  var sect = `${uid}`.slice(0, 3);
  if (typeof fetched_sections[sect] === "undefined"){
    var query_url = url + "assets/member/" + sect + ".bin.zip";
    var data_list = null;
    try {
      data_list = await fetchBinAndUnzip(query_url, null, null, null, true);
    } catch (error) {
      document.querySelector("#query-result").innerHTML += "Data loading failed! Please refresh the page or change the browser.";
      console.error(error);
      return;
    }
    let users = {};
    var user_groups = {};
    for (var user of data_list) {
      this_uid = user[0];
      item = user[1];
      if (typeof item === "undefined") item = [];
      user_groups = {};
      for (var i = 0; i < item.length; i+=4) {
        group_id = item[i];
        group_max_streak = item[i+1];
        group_max_completed_times = item[i+2];
        group_max_duration_days = item[i+3];
        user_groups[group_id] = {
          'group_max_streak': group_max_streak,
          'group_max_completed_times': group_max_completed_times,
          'group_max_duration_days': group_max_duration_days,
        };
      }
      books_index = user[2];
      if(typeof books_index === "undefined") books_index = [];
      books_name = [];
      for (var book_index of books_index) {
        books_name.push(books[book_index]);
      }
      word_dict_flatten = user[3];
      if (typeof word_dict_flatten === "undefined") word_dict_flatten = [];
      word_dict = {};
      for (var i = 0; i < word_dict_flatten.length; i+=2) {
        word_dict[word_dict_flatten[i]] = word_dict_flatten[i+1];
      }
      completed_times_flatten = user[4];
      if (typeof completed_times_flatten === "undefined") completed_times_flatten = [];
      completed_times = {};
      for (var i = 0; i < completed_times_flatten.length; i+=2) {
        completed_times[completed_times_flatten[i]] = completed_times_flatten[i+1];
      }
      fullInfos[this_uid] = {
        'user_groups': user_groups,
        'books_name': books_name,
        'word_dict': word_dict,
        'completed_times_dict': completed_times,
        'word_average': user[5],
        'c_time_average': user[6],
        'max_streak': user[7],
        'max_expectancy': user[8],
        'completed_time_average': user[9],
        'blacklist_info': user[10],
        'reputation': user[11],
        'streak_rank': user[12],
        'expectancy_rank': user[13],
        'word_rank': user[14],
        'time_rank': user[15],
      };
    }
  }
  if (uid in fullInfos)
    return fullInfos[uid];
  else {
    fullInfos[uid] = null;
    return null;
  }
}