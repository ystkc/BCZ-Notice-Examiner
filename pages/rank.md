---
layout: post
title: Mai's Escapade
date: 2024-11-30
categories: blog
tags: []
description: 麦花喵
permalink: /rank
---

<html lang="zh">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mai's Escapade</title>
  <link rel="stylesheet" href="{{ site.baseurl }}/assets/rank.css">
</head>
<body>
  <div id="info"></div><div class="mobile-controls"></div>
  <div class="query"><input type="number" placeholder="BczID here" id="query" placeholder="loading..." disabled><button onclick="queryInfos()" id="query-btn">Search</button></div>
  <div class="container" id="query-result"></div>
  <div class="container" id="leaderboard-container">
    <div id="leaderboard-5" class="leaderboard" style="display: none;"><h2>Sidereal</h2><table><thead><tr><th>ID</th><th>Nickname</th><th>Score</th></tr></thead><tbody id="list-5"><tr><td></td><td>Loading...</td></tr></tbody></table></div>
    <div id="leaderboard-0" class="leaderboard active"><h2>Streak</h2><table><thead><tr><th>ID</th><th>Nickname</th><th>Streak</th></tr></thead><tbody id="list-0"><tr><td></td><td>Loading...</td></tr></tbody></table></div>
    <div id="leaderboard-1" class="leaderboard"><h2>Expectancy</h2><table><thead><tr><th>ID</th><th>Nickname</th><th>Expectancy</th></tr></thead><tbody id="list-1"><tr><td></td><td>Loading...</td></tr></tbody></table></div>
    <div id="leaderboard-4" class="leaderboard"><h2>Reputation</h2><table><thead><tr><th>ID</th><th>Nickname</th><th>Credit</th></tr></thead><tbody id="list-4"><tr><td></td><td>Loading...</td></tr></tbody></table></div>
    <div id="leaderboard-2" class="leaderboard"><h2>Word</h2><table><thead><tr><th>ID</th><th>Nickname</th><th>7-day Average</th></tr></thead><tbody id="list-2"><tr><td></td><td>Loading...</td></tr></tbody></table></div>
    <div id="leaderboard-3" class="leaderboard"><h2>Time</h2><table><thead><tr><th>ID</th><th>Nickname</th><th>30-day Average</th></tr></thead><tbody id="list-3"><tr><td></td><td>Loading...</td></tr></tbody></table></div>
  </div>
  
  <!-- <script src="{{ site.baseurl }}/assets/js/jszip.min.js"></script> -->
  <!-- 加载rank和rankNames数据 -->
  <script src="{{ site.baseurl }}/assets/js/member_info_top_rate_screen.js"></script>
  <script src="{{ site.baseurl }}/assets/js/member_info_top_name.js"></script>
  <script src="{{ site.baseurl }}/assets/js/member_info_top_rate.js"></script>

  <script src="{{ site.baseurl }}/assets/js/rank.min.js"></script>
</body>
</html>
