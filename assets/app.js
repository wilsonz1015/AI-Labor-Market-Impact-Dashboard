(function(){
  if (!window.DASHBOARD_DATA) {
    console.error('Missing dashboard data. Make sure data/dashboard-data.js is loaded before assets/app.js.');
    return;
  }

  var OCC = window.DASHBOARD_DATA.OCC || [];
  var TSK = window.DASHBOARD_DATA.TSK || {};
  var LS = window.DASHBOARD_DATA.LS || [];
  var SOCM = window.DASHBOARD_DATA.SOCM || {};
  var INDUSTRY_ROWS = (window.DASHBOARD_DATA.INDUSTRY && window.DASHBOARD_DATA.INDUSTRY.occupationRows) || [];
  var OCC_PRIMARY_MAP = {};
  for (var ipi = 0; ipi < INDUSTRY_ROWS.length; ipi++) {
    var ir = INDUSTRY_ROWS[ipi] || {};
    var iid = String(ir.id || '');
    var ip = String(ir.primaryIndustry || 'Unspecified').trim() || 'Unspecified';
    if (iid && !OCC_PRIMARY_MAP[iid]) OCC_PRIMARY_MAP[iid] = ip;
    var ib = iid.split('.')[0];
    if (ib && !OCC_PRIMARY_MAP[ib]) OCC_PRIMARY_MAP[ib] = ip;
  }

var LSM={};for(var lsi=0;lsi<LS.length;lsi++)LSM[LS[lsi].id]=LS[lsi];

var SL={ch:"Chat"};
var CL={B:"Augmented",R:"At Risk",N:"Neutral"};
var src="ch",srt="aug",cat="all",qry="",mainPrimary="",dsrc="ch",curId="",tSort="sc",tSortDir=-1;
var mSort="s",mSortDir=-1;
var lsQry="",lsSort="c",lsSortDir=-1,lsCurId="",sumHoverId="";
var LSGL={all:"All",detailed:"Detailed",broad:"Broad",minor:"Minor",major:"Major",total:"Total"};

function pct(v){return(v*100).toFixed(1)+"%"}
function cls(v){return v>0?"p":v<0?"n":"z"}
function f2(v){return v.toFixed(2)}
function esc(s){return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}
function fql(a){if(a<=0)return"N/A";if(a<=2)return"Yearly";if(a<=6)return"Quarterly";if(a<=18)return"Monthly";if(a<=40)return"Twice/mo";if(a<=80)return"Weekly";if(a<=180)return"Few/wk";if(a<=350)return"Daily";if(a<=600)return"Multi/day";if(a<=900)return"Several/day";return"Hourly+"}
function tip(label,desc){return'<span class="tip-wrap">'+label+'<span class="tip-box">'+desc+'</span></span>'}
function tipDown(label,desc){return'<span class="tip-wrap tip-down">'+label+'<span class="tip-box">'+desc+'</span></span>'}
function nil(v){return v===null||v===undefined||v===""}
function fmtNum(v,d){if(nil(v))return"—";if(typeof v==="number")return v.toLocaleString(undefined,{minimumFractionDigits:d,maximumFractionDigits:d});return esc(String(v))}
function fmtScore(v){return nil(v)?"—":fmtNum(v,2)}
function fmtPct2(v){if(nil(v))return"—";if(typeof v==="number")return(v*100).toFixed(2)+"%";return esc(String(v))}
function fmtMoney0(v){if(nil(v))return"—";if(typeof v==="number")return"$"+Math.round(v).toLocaleString();return esc(String(v))}
function fmtInt(v){if(nil(v))return"—";if(typeof v==="number")return Math.round(v).toLocaleString();return esc(String(v))}
function fmtK(v){if(nil(v))return"—";if(typeof v==="number")return v.toLocaleString(undefined,{minimumFractionDigits:1,maximumFractionDigits:1});return esc(String(v))}
function grpBadge(g){return'<span class="grp-badge">'+(LSGL[g]||esc(String(g)))+'</span>'}
function pctArrow(v){return nil(v)?"":(v>0?" ↑":v<0?" ↓":"")}
function scoreHue(v){if(nil(v))return 0;var t=Math.max(0,Math.min(1,(Number(v)-1)/4));return Math.round(t*120)}
function scoreChip(v,lg){if(nil(v))return '<span class="score-chip na'+(lg?' lg':'')+'">—</span>';var h=scoreHue(v),bg='hsla('+h+',78%,55%,.12)',bd='hsla('+h+',78%,55%,.34)',tx='hsl('+h+',78%,64%)';return '<span class="score-chip'+(lg?' lg':'')+'" style="background:'+bg+';border-color:'+bd+';color:'+tx+'">'+fmtNum(v,2)+'</span>'}
function trimLabel(s,m){return !s?"":(s.length>m?s.slice(0,m-1)+'…':s)}
function baseSoc(id){return String(id).split('.')[0]}
function primaryIndustryForId(id){return OCC_PRIMARY_MAP[String(id||'')]||OCC_PRIMARY_MAP[baseSoc(id)]||'Unspecified'}
window.primaryIndustryForId=primaryIndustryForId
var MAIN_PRIMARY_LIST=(function(){var seen={},out=[];for(var k in OCC_PRIMARY_MAP){if(!Object.prototype.hasOwnProperty.call(OCC_PRIMARY_MAP,k))continue;var p=String(OCC_PRIMARY_MAP[k]||'Unspecified').trim()||'Unspecified';if(!seen[p]){seen[p]=1;out.push(p)}}return out.sort(function(a,b){a=a.toLowerCase();b=b.toLowerCase();return a<b?-1:a>b?1:0})})();
function mainPrimaryOptionsHtml(selected){var h='<option value="">All primary industries</option>';for(var i=0;i<MAIN_PRIMARY_LIST.length;i++)h+='<option value="'+esc(MAIN_PRIMARY_LIST[i])+'"'+(MAIN_PRIMARY_LIST[i]===selected?' selected':'')+'>'+esc(MAIN_PRIMARY_LIST[i])+'</option>';return h}
function lsForOcc(id){return LSM[baseSoc(id)]||null}
function upperBound(arr,val){var lo=0,hi=arr.length;while(lo<hi){var mid=(lo+hi)>>1;if(arr[mid]<=val)lo=mid+1;else hi=mid}return lo}
function pctRankSorted(arr,val){if(!arr.length)return .5;if(arr.length===1)return 1;var idx=Math.max(0,upperBound(arr,val)-1);return idx/(arr.length-1)}
function fmtSigned2(v){if(nil(v))return '—';return (v>0?'+':'')+f2(v)}

function socKey(id){
  id=String(id||'');
  return SOCM[id]?id:(SOCM[baseSoc(id)]?baseSoc(id):'');
}
window.socInfo=function(id){
  var k=socKey(id);
  return k?SOCM[k]:null;
};
window.buildSocDescBox=function(id,label){
  var k=socKey(id),info=k?SOCM[k]:null,desc=info&&info[1]?info[1]:'',cap=label||'Job description';
  if(k&&String(id)!==k)cap+=' (base SOC '+k+')';
  else if(k)cap+=' ('+k+')';
  if(desc)return '<div class="soc-desc"><div class="soc-cap">'+esc(cap)+'</div><div class="soc-copy">'+esc(desc)+'</div></div>';
  return '<div class="soc-desc"><div class="soc-cap">'+esc(cap)+'</div><div class="soc-copy miss">BLS does not publish a narrative definition for this SOC level in the referenced workbook.</div></div>';
};



function tObj(t,sk){
  var o={tk:t[0],im:t[1],rl:t[2],fa:t[3],fw:t[4],hu:t[5],ai:t[6]};
  if(t[6]===1){var a=t[7];
    o.e=a[0];o.au=a[1];o.ag=a[2];o.sc=a[3];o.d=a[4];o.fb=a[5];o.ti=a[6];o.v=a[7];o.l=a[8];o.u=a[9];
  }else{o.e=0;o.au=0;o.ag=0;o.sc=0;o.d=0;o.fb=0;o.ti=0;o.v=0;o.l=0;o.u=0;}
  return o
}

function stats(){
  var b=0,r=0,n=0;
  for(var i=0;i<OCC.length;i++){var c=OCC[i][src].ct;if(c==="B")b++;else if(c==="R")r++;else n++}
  document.getElementById("sts").innerHTML='<div class="st"><div class="d g"></div><b>'+b+'</b><span>Augmented</span></div><div class="st"><div class="d r"></div><b>'+r+'</b><span>At Risk</span></div><div class="st"><div class="d y"></div><b>'+n+'</b><span>Neutral</span></div>'
}

/* Main table columns config */
var mainCols=[
  {k:"n",  l:"Occupation",          t:"O*NET occupation title. Click any row for detailed task breakdown.",s:"min-width:240px"},
  {k:"primaryIndustry",l:"Primary Industry",t:"Higher-level industry grouping used for filtering in the investment tabs.",s:"min-width:180px"},
  {k:"s",  l:"Augmentation Score", t:"Frequency-weighted average of task scores. Positive = net augmentation, negative = displacement risk.", main:true},
  {k:"ct", l:"Category",            t:"Augmented (positive score), At Risk (negative), or Neutral (zero/below threshold)."},
  {k:"ai", l:"AI Tasks",            t:"Tasks with a non-zero displayed AI score / total O*NET tasks."},
  {k:"cv", l:"Coverage",            t:"% of occupation tasks with a non-zero displayed AI score."},
  {k:"au", l:"Avg Automation",      t:"Mean automation share (Directive + Feedback Loop) across tasks with a non-zero displayed AI score."},
  {k:"ag", l:"Avg Augmentation",    t:"Mean augmentation share (Task Iteration + Validation + Learning) across tasks with a non-zero displayed AI score."}
];

function renderMainTh(){
  var h="";
  for(var i=0;i<mainCols.length;i++){
    var c=mainCols[i];
    var isSorted=c.k===mSort;
    var arrow=isSorted?(mSortDir===1?" &#9650;":" &#9660;"):" &#8597;";
    h+='<th'+(c.s?' style="'+c.s+'"':'')+' class="'+(isSorted?"sorted ":"")+(c.main?'primary-col-head':'')+'" onclick="msort(\''+c.k+'\')">';
    h+=tipDown(c.l+'<span class="sa">'+arrow+'</span>',c.t);
    h+='</th>';
  }
  document.getElementById("mainTh").querySelector("tr").innerHTML=h;
}

window.msort=function(col){
  if(mSort===col){mSortDir*=-1}else{mSort=col;mSortDir=(col==="n"||col==="primaryIndustry")?1:-1}
  srt="custom";
  var ps=document.querySelectorAll("#srtP .pl");for(var i=0;i<ps.length;i++)ps[i].classList.remove("on");
  render();
renderLS();
};

function render(){
  renderMainTh();
  var list=OCC.slice();
  if(qry){var q=qry.toLowerCase();list=list.filter(function(o){var pi=String(primaryIndustryForId(o.id)).toLowerCase();return o.n.toLowerCase().indexOf(q)>=0||o.id.toLowerCase().indexOf(q)>=0||pi.indexOf(q)>=0})}
  if(mainPrimary)list=list.filter(function(o){return primaryIndustryForId(o.id)===mainPrimary});
  if(cat!=="all")list=list.filter(function(o){return o[src].ct===cat});
  if(srt==="aug"){list.sort(function(a,b){return b[src].s-a[src].s})}
  else if(srt==="risk"){list.sort(function(a,b){return a[src].s-b[src].s})}
  else if(srt==="az"){list.sort(function(a,b){return a.n.localeCompare(b.n)})}
  else{
    var sk=mSort,dir=mSortDir;
    list.sort(function(a,b){
      var va,vb;
      if(sk==="n"){va=a.n.toLowerCase();vb=b.n.toLowerCase();return dir*(va<vb?-1:va>vb?1:0)}
      else if(sk==="primaryIndustry"){va=primaryIndustryForId(a.id).toLowerCase();vb=primaryIndustryForId(b.id).toLowerCase();return dir*(va<vb?-1:va>vb?1:0)}
      else if(sk==="ct"){va=a[src].ct;vb=b[src].ct;return dir*(va<vb?-1:va>vb?1:0)}
      else if(sk==="ai"){va=a[src].ai;vb=b[src].ai;return dir*(va-vb)}
      else{va=a[src][sk];vb=b[src][sk];return dir*(va-vb)}
    });
  }
  document.getElementById("cnt").textContent=list.length+" occupations";
  var h="";
  for(var i=0;i<list.length;i++){var o=list[i],d=o[src];
    h+='<tr data-id="'+o.id+'" class="clickable-row" title="Click for drill-down"><td class="tn">'+esc(o.n)+'</td><td>'+esc(primaryIndustryForId(o.id))+'</td><td class="m primary-col-cell '+cls(d.s)+'">'+f2(d.s)+'</td><td><span class="bg '+d.ct+'">'+CL[d.ct]+'</span></td><td class="m">'+d.ai+' <span style="color:var(--t4)">/</span> '+o.t+'</td><td class="m">'+pct(d.cv)+'</td><td class="m n">'+pct(d.au)+'</td><td class="m p">'+pct(d.ag)+'</td></tr>'}
  document.getElementById("tb").innerHTML=h;stats()
}

/* Detail panel */
function sortTasks(tasks,sk,col,dir){
  var parsed=[];for(var i=0;i<tasks.length;i++)parsed.push(tObj(tasks[i],sk));
  parsed.sort(function(a,b){var va,vb;
    if(col==="tk"){va=a.tk.toLowerCase();vb=b.tk.toLowerCase();return dir*(va<vb?-1:va>vb?1:0)}
    va=a[col];vb=b[col];return dir*(va-vb)});
  return parsed
}

function buildTaskTable(id,sk,sortCol,sortDir){
  var raw=TSK[id]||[];
  if(!raw.length)return'<div class="sct" style="color:var(--t4);margin-top:12px">No task data.</div>';
  var tasks=sortTasks(raw,sk,sortCol,sortDir,id);
  var aiCount=0,scoreEligibleCount=0;for(var i=0;i<tasks.length;i++){if(tasks[i].ai)aiCount++;if(isScoreEligibleAiTask(tasks[i]))scoreEligibleCount++;}
  var h='<div class="sct">All Tasks ('+tasks.length+' total, '+scoreEligibleCount+' score-eligible AI tasks, '+aiCount+' with any AI data)</div>';
  h+='<div class="scs">Interaction values show % of total interactions per task. Freq Wt% = share of this occupation\'s total frequency weight. Click column headers to sort.</div>';
  h+='<div style="background:var(--s1);border:1px solid var(--b1);border-radius:var(--r);padding:10px 14px;margin-bottom:14px;font-size:.76rem;color:var(--t3);line-height:1.5"><span style="color:var(--amb);font-weight:600">[human]</span> = Task requires physical presence or face-to-face interaction (e.g. examining patients, classroom teaching, operating machinery). These tasks are excluded from AI scoring even if AI interaction data exists, because the task itself cannot be performed by AI.</div>';
  h+='<div style="overflow-x:auto;border:1px solid var(--b1);border-radius:var(--r)"><table class="tt"><thead>';
  h+='<tr><th colspan="4" style="border-right:1px solid var(--b2)">Task Details</th>';
  h+='<th colspan="2" style="border-right:1px solid var(--b2)">Scores</th>';
  h+='<th colspan="3" class="cg-auto" style="border-right:1px solid var(--b2);text-align:center">Automation (Dir + FB)</th>';
  h+='<th colspan="3" class="cg-aug" style="border-right:1px solid var(--b2);text-align:center">Augmentation (TI + Val + Lrn)</th>';
  h+='<th>Other</th></tr><tr>';
  var cols=[
    ["tk","Task","O*NET task description.",""],
    ["im","Imp","Importance (1-5).",""],
    ["rl","Rel","Relevance (0-100).",""],
    ["fa","Freq","How often performed.",""],
    ["fw","FW%","Share of occupation frequency weight.|border-right:1px solid var(--b2)"],
    ["sc","Score","Task score for chat data.|"],
    ["au","A/A%","Visual: red=automation, green=augmentation.|border-right:1px solid var(--b2)"],
    ["d","Dir%","Directive %. Automation.|cg-auto"],
    ["fb","FB%","Feedback Loop %. Automation.|cg-auto"],
    ["au","Tot%","Total automation (Dir+FB).|cg-auto|border-right:1px solid var(--b2)"],
    ["ti","TI%","Task Iteration %. Augmentation.|cg-aug"],
    ["v","Val%","Validation %. Augmentation.|cg-aug"],
    ["l","Lrn%","Learning %. Augmentation.|cg-aug|border-right:1px solid var(--b2)"],
    ["u","Unc%","Unclassified %."]
  ];
  for(var i=0;i<cols.length;i++){
    var c=cols[i],parts=c[2].split("|"),desc=parts[0],extra="",cls2="";
    for(var p=1;p<parts.length;p++){if(parts[p].indexOf("cg-")===0)cls2=" "+parts[p];else extra+=parts[p]+";"}
    var isSorted=c[0]===sortCol;
    var arrow=isSorted?(sortDir===1?" &#9650;":" &#9660;"):" &#8597;";
    h+='<th class="'+(isSorted?"sorted":"")+cls2+'" style="cursor:pointer;'+(extra||"")+'" onclick="tsort(\''+c[0]+'\')">';
    h+=tip(c[1]+'<span class="sa">'+arrow+'</span>',desc);
    h+='</th>'
  }
  h+='</tr></thead><tbody>';
  for(var j=0;j<tasks.length;j++){
    var t=tasks[j],isAI=t.ai===1,rc=isAI?"":"no-ai-row",hfl=t.hu?'<span class="hf">[human]</span>':'';
    h+='<tr class="'+rc+'"><td class="tx">'+esc(t.tk)+hfl+'</td>';
    h+='<td class="m">'+t.im+'</td><td class="m">'+t.rl+'</td>';
    h+='<td class="fl">'+fql(t.fa)+'</td>';
    h+='<td class="m" style="border-right:1px solid var(--b2)">'+t.fw+'%</td>';
    if(isAI){
      h+='<td class="m '+cls(t.sc)+'">'+t.sc.toFixed(1)+'</td>';
      h+='<td style="border-right:1px solid var(--b2)"><div style="display:flex;height:7px;border-radius:4px;overflow:hidden;min-width:50px"><div style="width:'+pct(t.au)+';background:var(--red)"></div><div style="width:'+pct(t.ag)+';background:var(--grn)"></div></div></td>';
      h+='<td class="m n">'+t.d+'%</td><td class="m n">'+t.fb+'%</td>';
      h+='<td class="m n" style="border-right:1px solid var(--b2);font-weight:600">'+pct(t.au)+'</td>';
      h+='<td class="m p">'+t.ti+'%</td><td class="m p">'+t.v+'%</td>';
      h+='<td class="m p" style="border-right:1px solid var(--b2)">'+t.l+'%</td>';
      h+='<td class="m z">'+t.u+'%</td>'
    }else{h+='<td class="m z" colspan="9" style="text-align:center;font-style:italic">No AI interaction data</td>'}
    h+='</tr>'
  }
  h+='</tbody></table></div>';return h
}

function buildDetail(id){
  var o=null;for(var i=0;i<OCC.length;i++){if(OCC[i].id===id){o=OCC[i];break}}
  if(!o)return"";curId=id;
  var s=dsrc,d=o[s];
  var h='<button class="x" id="xb">&times;</button>';
  h+='<div class="dt">'+esc(o.n)+'</div>';
  h+='<div class="dc">'+o.id+' &middot; '+o.t+' total tasks</div>';
  h+='<div class="dw"><span>Data source:</span><span class="grp-badge">AI usage data</span></div>';
  h+='<div class="sc-row">';
  h+='<div class="sc-box"><div class="lb">Score ('+SL[s]+')</div><div class="vl '+cls(d.s)+'">'+f2(d.s)+'</div><div class="mt"><span class="bg '+d.ct+'" style="font-size:.6rem;padding:1px 7px">'+CL[d.ct]+'</span></div></div>';
  var detailTasks=sortTasks(TSK[id]||[],s,tSort,tSortDir,id),eligibleAiCount=0;
    for(var k=0;k<detailTasks.length;k++){if(isScoreEligibleAiTask(detailTasks[k]))eligibleAiCount++}
    var eligibleCoverage=o.t?eligibleAiCount/o.t:0;
    h+='<div class="sc-box"><div class="lb">AI Coverage</div><div class="vl" style="font-size:1.4rem">'+eligibleAiCount+' <span style="font-size:.9rem;color:var(--t3)">/ '+o.t+'</span></div><div class="mt">'+pct(eligibleCoverage)+' coverage</div></div>';
  h+='<div class="sc-box"><div class="lb">Automation vs Augmentation</div><div style="margin-top:8px"><div class="br"><div class="bl">Auto</div><div class="bt"><div class="bfa" style="width:'+pct(d.au)+'"></div></div><div class="bv n">'+pct(d.au)+'</div></div><div class="br"><div class="bl">Aug</div><div class="bt"><div class="bfg" style="width:'+pct(d.ag)+'"></div></div><div class="bv p">'+pct(d.ag)+'</div></div></div></div>';
  h+='</div>';
  h+='<div id="ta">'+buildTaskTable(id,dsrc,tSort,tSortDir)+'</div>';
  h+='<div class="contact-note pnl-contact-note"><strong>Questions?</strong> Please direct any questions to Wilson Zhang at <a href="mailto:wilson.z1015@gmail.com" style="color:var(--blue);text-decoration:none">wilson.z1015@gmail.com</a> / <a href="https://www.linkedin.com/in/wilsonzhang10/" target="_blank" rel="noopener" style="color:var(--blue);text-decoration:none">https://www.linkedin.com/in/wilsonzhang10/</a>.</div>';
  return h
}

function detail(id){dsrc=src;tSort="sc";tSortDir=-1;document.getElementById("pnl").innerHTML=buildDetail(id);document.getElementById("ov").classList.add("open");document.body.style.overflow="hidden";document.getElementById("xb").onclick=cld}
window.detail=detail;
window.ssrc=function(ns){dsrc="ch";tSort="sc";tSortDir=-1;document.getElementById("pnl").innerHTML=buildDetail(curId);document.getElementById("xb").onclick=cld};
window.tsort=function(col){if(tSort===col){tSortDir*=-1}else{tSort=col;tSortDir=-1}document.getElementById("ta").innerHTML=buildTaskTable(curId,dsrc,tSort,tSortDir)};
function cld(){document.getElementById("ov").classList.remove("open");document.body.style.overflow=""}


var lsCols=[
  {k:"n",l:"Occupation",t:"BLS/SOC occupation title. Click any row for score and history details.",s:"min-width:320px"},
  {k:"c",l:"Composite",t:"Equal-weight average of projected employment, wage, and actual employment scores when all three are available."},
  {k:"ps",l:"Proj Emp Score",t:"1–5 score derived from the occupation’s 2024–2034 projected employment CAGR percentile rank."},
  {k:"ws",l:"Wage Score",t:"1–5 score derived from the occupation’s actual wage CAGR percentile rank."},
  {k:"es",l:"Act Emp Score",t:"1–5 score derived from the occupation’s actual employment CAGR percentile rank."},
  {k:"g",l:"Group",t:"SOC aggregation level from the workbook: detailed, broad, minor, major, or total."}
];

function lsCompare(a,b,key,dir){
  var va=a[key],vb=b[key],an=nil(va),bn=nil(vb);
  if(key==="n"||key==="g"){
    if(an&&bn)return 0;if(an)return 1;if(bn)return -1;
    va=String(va).toLowerCase();vb=String(vb).toLowerCase();
    return dir*(va<vb?-1:va>vb?1:0);
  }
  if(an&&bn)return 0;
  if(an)return 1;
  if(bn)return -1;
  return dir*(va-vb);
}

function renderLsTh(){
  var h="";
  for(var i=0;i<lsCols.length;i++){
    var c=lsCols[i],isSorted=c.k===lsSort;
    var arrow=isSorted?(lsSortDir===1?" &#9650;":" &#9660;"):" &#8597;";
    h+='<th'+(c.s?' style="'+c.s+'"':'')+' class="'+(isSorted?"sorted":"")+'" onclick="lssort(\''+c.k+'\')">';
    h+=tipDown(c.l+'<span class="sa">'+arrow+'</span>',c.t);
    h+='</th>';
  }
  document.getElementById("lsTh").querySelector("tr").innerHTML=h;
}

function renderLS(){
  renderLsTh();
  var list=LS.slice();
  if(lsQry){
    var q=lsQry.toLowerCase();
    list=list.filter(function(o){return o.n.toLowerCase().indexOf(q)>=0||o.id.toLowerCase().indexOf(q)>=0});
  }
  list.sort(function(a,b){return lsCompare(a,b,lsSort,lsSortDir)});
  document.getElementById("lsCnt").textContent=list.length.toLocaleString()+" occupations";
  var h="";
  for(var j=0;j<list.length;j++){
    var o=list[j];
    h+='<tr data-id="'+o.id+'">';
    h+='<td><div class="tn">'+esc(o.n)+'</div></td>';
    h+='<td>'+scoreChip(o.c)+'</td>';
    h+='<td>'+scoreChip(o.ps)+'</td>';
    h+='<td>'+scoreChip(o.ws)+'</td>';
    h+='<td>'+scoreChip(o.es)+'</td>';
    h+='<td>'+grpBadge(o.g)+'</td>';
    h+='</tr>';
  }
  document.getElementById("lsTb").innerHTML=h;
}

function lsMetricRow(label,val){return '<div class="k">'+label+'</div><div class="v">'+val+'</div>'}

function buildLSDetail(id){
  var o=LSM[id];
  if(!o)return"";
  lsCurId=id;
  var h='<button class="x" id="xb">&times;</button>';
  h+='<div class="dt">'+esc(o.n)+'</div>';
  h+='<div class="dc">'+o.id+' &middot; '+(LSGL[o.g]||o.g)+'</div>';
  h+='<div class="sc-row">';
  h+='<div class="sc-box"><div class="lb">Composite Score</div><div class="vl">'+scoreChip(o.c,true)+'</div><div class="mt">Equal-weight average of available pillars</div></div>';
  h+='<div class="sc-box"><div class="lb">Projected Employment Score</div><div class="vl">'+scoreChip(o.ps,true)+'</div><div class="mt">From 2024–2034 projected employment CAGR</div></div>';
  h+='<div class="sc-box"><div class="lb">Wage Score</div><div class="vl">'+scoreChip(o.ws,true)+'</div><div class="mt">From actual wage CAGR</div></div>';
  h+='<div class="sc-box"><div class="lb">Actual Employment Score</div><div class="vl">'+scoreChip(o.es,true)+'</div><div class="mt">From actual employment CAGR</div></div>';
  h+='</div>';
  h+='<div class="sc-row">';
  h+='<div class="sc-box"><div class="lb">Projected Employment CAGR</div><div class="vl '+cls(nil(o.pc)?0:o.pc)+'">'+fmtPct2(o.pc)+'</div><div class="mt">2024–2034 BLS projection</div></div>';
  h+='<div class="sc-box"><div class="lb">Wage CAGR Used</div><div class="vl '+cls(nil(o.wc)?0:o.wc)+'">'+fmtPct2(o.wc)+'</div><div class="mt">Window: '+(o.wb?o.wb.replace(/-/g,'–'):'N/A')+'</div></div>';
  h+='<div class="sc-box"><div class="lb">Actual Employment CAGR Used</div><div class="vl '+cls(nil(o.ec)?0:o.ec)+'">'+fmtPct2(o.ec)+'</div><div class="mt">Window: '+(o.eb?o.eb.replace(/-/g,'–'):'N/A')+'</div></div>';
  h+='<div class="sc-box"><div class="lb">Score Coverage</div><div class="vl" style="font-size:1.05rem;line-height:1.45;font-family:inherit">'+grpBadge(o.g)+'</div><div class="mt">Workbook SOC level for this row</div></div>';
  h+='</div>';
  if(nil(o.ps))h+='<div class="inline-note">Projected employment fields are blank for this occupation code in the workbook’s projection match, so the projected employment score and composite score are also blank.</div>';
  h+='<div class="sct">Actual Wage and Employment History</div>';
  h+='<div class="scs">These are the 2019–2024 values carried into the dashboard from the workbook. The wage score uses the annual wage series; the actual employment score uses the employment series.</div>';
  h+='<div style="overflow-x:auto;border:1px solid var(--b1);border-radius:var(--r);margin-bottom:16px"><table class="tt"><thead><tr><th>Year</th><th>Mean Annual Wage</th><th>Employment</th></tr></thead><tbody>';
  for(var yr=2019;yr<=2024;yr++){
    var idx=yr-2019;
    h+='<tr><td class="m">'+yr+'</td><td class="m">'+fmtMoney0(o.wa[idx])+'</td><td class="m">'+fmtInt(o.em[idx])+'</td></tr>';
  }
  h+='</tbody></table></div>';
  h+='<div class="sct">Projected Employment CAGR</div>';
  h+='<div class="scs">This drill-down now shows only the projected employment CAGR from the workbook’s BLS Employment Projections source.</div>';
  h+='<div class="kv">';
  h+=lsMetricRow('Projected employment CAGR, 2024–2034',fmtPct2(o.pc));
  h+='</div>';
  h+='<div class="inline-note">The workbook keeps only the fields needed here. Any special BLS markers in the history series (for example, <span class="m">*</span> or <span class="m">**</span>) are carried through unchanged rather than inferred.</div>';
  h+='<div class="contact-note pnl-contact-note"><strong>Questions?</strong> Please direct any questions to Wilson Zhang at <a href="mailto:wilson.z1015@gmail.com" style="color:var(--blue);text-decoration:none">wilson.z1015@gmail.com</a> / <a href="https://www.linkedin.com/in/wilsonzhang10/" target="_blank" rel="noopener" style="color:var(--blue);text-decoration:none">https://www.linkedin.com/in/wilsonzhang10/</a>.</div>';
  return h;
}

function lsDetail(id){document.getElementById("pnl").innerHTML=buildLSDetail(id);document.getElementById("ov").classList.add("open");document.body.style.overflow="hidden";document.getElementById("xb").onclick=cld}
window.lssort=function(col){if(lsSort===col){lsSortDir*=-1}else{lsSort=col;lsSortDir=(col==="n"||col==="g")?1:-1}renderLS()};

function syncSourceButtons(){
  var groups=["srcP","sumSrcP"];
  for(var gi=0;gi<groups.length;gi++){
    var el=document.getElementById(groups[gi]);
    if(!el)continue;
    var bs=el.querySelectorAll('.pl');
    for(var bi=0;bi<bs.length;bi++)bs[bi].classList.toggle('on',bs[bi].getAttribute('data-s')===src);
  }
}

function setSource(ns){src="ch";syncSourceButtons();render();renderSummary()}

function buildSummaryData(){
  var pts=[];
  for(var i=0;i<OCC.length;i++){
    var o=OCC[i],l=lsForOcc(o.id);
    if(!l||nil(l.c))continue;
    var d=o[src];
    if(!d||nil(d.s))continue;
    pts.push({id:o.id,n:o.n,base:baseSoc(o.id),x:d.s,y:l.c,auto:d.au,aug:d.ag,cat:d.ct,lab:l});
  }
  var xs=[],ys=[];
  for(var j=0;j<pts.length;j++){xs.push(pts[j].x);ys.push(pts[j].y)}
  xs.sort(function(a,b){return a-b});
  ys.sort(function(a,b){return a-b});
  for(var k=0;k<pts.length;k++){
    pts[k].xp=pctRankSorted(xs,pts[k].x);
    pts[k].yp=pctRankSorted(ys,pts[k].y);
    pts[k].benefit=pts[k].x>0?(pts[k].xp+pts[k].yp):-999;
    pts[k].suffer=pts[k].x<0?((1-pts[k].xp)+(1-pts[k].yp)):-999;
  }
  var benefit=pts.filter(function(p){return p.x>0}).slice().sort(function(a,b){return b.benefit-a.benefit||b.x-a.x||b.y-a.y}).slice(0,20);
  var suffer=pts.filter(function(p){return p.x<0}).slice().sort(function(a,b){return b.suffer-a.suffer||a.x-b.x||a.y-b.y}).slice(0,20);
  var marks={};
  for(var bi=0;bi<benefit.length;bi++)marks[benefit[bi].id]={kind:'benefit',rank:bi+1};
  for(var si=0;si<suffer.length;si++)marks[suffer[si].id]={kind:'suffer',rank:si+1};
  return {points:pts,benefit:benefit,suffer:suffer,marks:marks};
}

function makeSummaryList(arr,kind){
  function headCell(label,tip,extraCls){
    return '<div class="cell'+(extraCls?' '+extraCls:'')+'" title="'+esc(tip)+'"><span class="tip-label">'+esc(label)+'</span></div>';
  }
  var sumTip=kind==='benefit'
    ? 'AI percentile plus labor shortage percentile. Higher values indicate occupations that rank more strongly on both AI upside and labor shortage pressure.'
    : 'AI percentile plus labor shortage percentile. Lower values indicate occupations with more downside exposure; this table is ordered from the lowest combined percentiles upward.';
  var h='<div class="sum-list-head">'+
    headCell('#','Rank within this top-20 list.')+
    headCell('Occupation','Occupation title from O*NET.')+
    headCell('AI augmentation vs. automation score','Net AI score for the occupation. Positive values suggest more augmentation upside; negative values suggest more automation exposure.','num')+
    headCell('AI percentile','Percentile rank of the occupation\'s AI augmentation vs. automation score across plotted occupations.','num')+
    headCell('Labor shortage score','Composite labor shortage score for the occupation. Higher values indicate tighter labor market pressure.','num')+
    headCell('Labor percentile','Percentile rank of the occupation\'s labor shortage score across plotted occupations.','num')+
    headCell('Sum of percentiles',sumTip,'num')+
  '</div>';
  for(var i=0;i<arr.length;i++){
    var p=arr[i],sumVal=p.xp+p.yp,sumCls=kind==='benefit'?'p':'n',aiCls=p.x>0?'p':p.x<0?'n':'z';
    h+='<div class="sum-item" data-id="'+p.id+'">'+
      '<div class="cell rk">'+(i+1)+'</div>'+
      '<div class="cell nm">'+esc(p.n)+'</div>'+
      '<div class="cell num m '+aiCls+'">'+fmtSigned2(p.x)+'</div>'+
      '<div class="cell num m pctv">'+pct(p.xp)+'</div>'+
      '<div class="cell num">'+scoreChip(p.y)+'</div>'+
      '<div class="cell num m pctv">'+pct(p.yp)+'</div>'+
      '<div class="cell num m sumv '+sumCls+'">'+f2(sumVal)+'</div>'+
    '</div>';
  }
  return h;
}

function showSumTip(ev,p){
  var tip=document.getElementById('sumTip'),card=document.getElementById('quadCard');
  if(!tip||!card)return;
  tip.innerHTML='<b>'+esc(p.n)+'</b><br><span style="font-family:IBM Plex Mono,monospace;color:var(--t4)">'+p.id+' &middot; SOC '+p.base+'</span><br>AI score: <span class="'+(p.x>0?'p':p.x<0?'n':'z')+'">'+fmtSigned2(p.x)+'</span><br>Labor shortage composite: '+fmtNum(p.y,2)+'<br>Automation: '+pct(p.auto)+' &middot; Augmentation: '+pct(p.aug)+'<br>Click to open the AI task drill-down';
  tip.style.display='block';
  var rect=card.getBoundingClientRect();
  var x=ev.clientX-rect.left+14,y=ev.clientY-rect.top+14;
  x=Math.min(x,rect.width-330); y=Math.min(y,rect.height-120);
  if(x<10)x=10; if(y<10)y=10;
  tip.style.left=x+'px'; tip.style.top=y+'px';
}
function hideSumTip(){var tip=document.getElementById('sumTip');if(tip)tip.style.display='none'}

function renderSummary(){
  var svg=document.getElementById('quadSvg');
  if(!svg)return;
  syncSourceButtons();
  var data=buildSummaryData();
  document.getElementById('sumNote').textContent=data.points.length.toLocaleString()+' occupations are plotted because they have both an AI score for '+SL[src]+' and a composite labor shortage score. Labels are shown for the 20 strongest AI tailwinds and the 20 strongest AI headwinds, ranked by combined percentile across the two axes.';
  document.getElementById('sumBenefit').innerHTML=makeSummaryList(data.benefit,'benefit');
  document.getElementById('sumSuffer').innerHTML=makeSummaryList(data.suffer,'suffer');
  var W=1200,H=620,L=260,R=940,T=34,B=542,PW=R-L,PH=B-T;
  var absRaw=1;
  for(var i=0;i<data.points.length;i++)absRaw=Math.max(absRaw,Math.abs(data.points[i].x));
  var absX=Math.ceil(absRaw*1.1);
  if(absX<5)absX=5;
  var xMin=-absX,xMax=absX,yMin=1,yMax=5;
  function xScale(v){return L+(v-xMin)/(xMax-xMin)*PW}
  function yScale(v){return T+(yMax-v)/(yMax-yMin)*PH}
  var x0=xScale(0),y3=yScale(3);
  function axisLabel(v){var av=Math.abs(v);var s=av>=10?String(Math.round(v)):String(Math.round(v*10)/10);return s.replace(/\.0$/,'')}
  function escAttr(s){return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
  function place(items,top,bottom,gap){items=items.slice().sort(function(a,b){return a.cy-b.cy});for(var i=0;i<items.length;i++)items[i].ly=Math.max(top,Math.min(bottom,items[i].cy));for(var j=1;j<items.length;j++)if(items[j].ly<items[j-1].ly+gap)items[j].ly=items[j-1].ly+gap;if(items.length&&items[items.length-1].ly>bottom){items[items.length-1].ly=bottom;for(var k=items.length-2;k>=0;k--)if(items[k].ly>items[k+1].ly-gap)items[k].ly=items[k+1].ly-gap;if(items[0].ly<top){items[0].ly=top;for(var m=1;m<items.length;m++)if(items[m].ly<items[m-1].ly+gap)items[m].ly=items[m-1].ly+gap;}}return items}
  function labelSpec(p,kind){var txt=trimLabel(p.n,26),est=txt.length*5.2,x,anchor;if(kind==='benefit'){x=p.cx+8;anchor='start';if(x+est>R-4){x=p.cx-8;anchor='end'}}else{x=p.cx-8;anchor='end';if(x-est<L+4){x=p.cx+8;anchor='start'}}return {text:txt,x:x,anchor:anchor}}
    var h='';
    h+='<rect x="0" y="0" width="'+W+'" height="'+H+'" fill="transparent"/>';
    h+='<rect x="'+L+'" y="'+T+'" width="'+(x0-L)+'" height="'+(y3-T)+'" fill="rgba(251,191,36,.04)"/>';
    h+='<rect x="'+x0+'" y="'+T+'" width="'+(R-x0)+'" height="'+(y3-T)+'" fill="rgba(52,211,153,.05)"/>';
    h+='<rect x="'+L+'" y="'+y3+'" width="'+(x0-L)+'" height="'+(B-y3)+'" fill="rgba(248,113,113,.05)"/>';
    h+='<rect x="'+x0+'" y="'+y3+'" width="'+(R-x0)+'" height="'+(B-y3)+'" fill="rgba(76,154,255,.04)"/>';
    for(var y=1;y<=5;y++){var yy=yScale(y);h+='<line x1="'+L+'" y1="'+yy+'" x2="'+R+'" y2="'+yy+'" stroke="rgba(255,255,255,.07)" stroke-width="1"/>';h+='<text x="'+(L-12)+'" y="'+(yy+4)+'" fill="var(--t4)" font-size="12" text-anchor="end">'+y+'</text>'}
    var xticks=[xMin,xMin/2,0,xMax/2,xMax];
    for(var xt=0;xt<xticks.length;xt++){var xv=xticks[xt],xx=xScale(xv);h+='<line x1="'+xx+'" y1="'+T+'" x2="'+xx+'" y2="'+B+'" stroke="rgba(255,255,255,.05)" stroke-width="1"/>';h+='<text x="'+xx+'" y="'+(B+22)+'" fill="var(--t4)" font-size="12" text-anchor="middle">'+axisLabel(xv)+'</text>'}
    h+='<line x1="'+L+'" y1="'+y3+'" x2="'+R+'" y2="'+y3+'" stroke="rgba(255,255,255,.18)" stroke-width="1.4"/>';
    h+='<line x1="'+x0+'" y1="'+T+'" x2="'+x0+'" y2="'+B+'" stroke="rgba(255,255,255,.18)" stroke-width="1.4"/>';
    h+='<rect x="'+L+'" y="'+T+'" width="'+PW+'" height="'+PH+'" fill="none" stroke="rgba(255,255,255,.14)" stroke-width="1"/>';
    h+='<text x="'+(L+16)+'" y="'+(T+18)+'" fill="rgba(251,191,36,.9)" font-size="12" font-weight="700">High shortage, automation risk</text>';
    h+='<text x="'+(R-16)+'" y="'+(T+18)+'" fill="rgba(52,211,153,.95)" font-size="12" font-weight="700" text-anchor="end">Benefit from AI</text>';
    h+='<text x="'+(L+16)+'" y="'+(B-14)+'" fill="rgba(248,113,113,.95)" font-size="12" font-weight="700">Suffer most from AI</text>';
    h+='<text x="'+(R-16)+'" y="'+(B-14)+'" fill="rgba(76,154,255,.95)" font-size="12" font-weight="700" text-anchor="end">AI lift, softer shortage</text>';
    h+='<text x="'+((L+R)/2)+'" y="'+(H-18)+'" fill="var(--t3)" font-size="13" text-anchor="middle">AI augmentation vs. automation score</text>';
    h+='<text x="'+(L+6)+'" y="'+(H-36)+'" fill="var(--red)" font-size="12">More automation risk</text>';
    h+='<text x="'+(R-6)+'" y="'+(H-36)+'" fill="var(--grn)" font-size="12" text-anchor="end">More augmentation gain</text>';
    h+='<text transform="translate(32 '+((T+B)/2)+') rotate(-90)" fill="var(--t3)" font-size="13" text-anchor="middle">Labor shortage composite score</text>';
    for(var pi=0;pi<data.points.length;pi++){
      var p=data.points[pi],mark=data.marks[p.id],cx=xScale(p.x),cy=yScale(p.y),fill=p.x>0?'#34d399':p.x<0?'#f87171':'#a8b8cc',op=mark?.95:.33,r=mark?5.6:3.2;
      p.cx=cx; p.cy=cy;
      h+='<circle class="sum-pt" data-id="'+escAttr(p.id)+'" cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="'+fill+'" fill-opacity="'+op+'" stroke="'+fill+'" stroke-opacity="'+(mark?.55:.18)+'" stroke-width="'+(mark?1.6:1)+'" style="cursor:pointer" />';
    }
    var rightItems=place(data.benefit,T+18,B-8,15),leftItems=place(data.suffer,T+18,B-8,15);
    for(var ri=0;ri<rightItems.length;ri++){
      var rp=rightItems[ri],rs=labelSpec(rp,'benefit');
      h+='<text x="'+rs.x+'" y="'+(rp.ly+3.5)+'" fill="rgba(52,211,153,.98)" font-size="9.25" font-weight="600" text-anchor="'+rs.anchor+'" paint-order="stroke" stroke="rgba(7,9,15,.96)" stroke-width="2.4" stroke-linejoin="round" style="pointer-events:none">'+esc(rs.text)+'</text>';
    }
    for(var li=0;li<leftItems.length;li++){
      var lp=leftItems[li],ls=labelSpec(lp,'suffer');
      h+='<text x="'+ls.x+'" y="'+(lp.ly+3.5)+'" fill="rgba(248,113,113,.98)" font-size="9.25" font-weight="600" text-anchor="'+ls.anchor+'" paint-order="stroke" stroke="rgba(7,9,15,.96)" stroke-width="2.4" stroke-linejoin="round" style="pointer-events:none">'+esc(ls.text)+'</text>';
    }
    svg.innerHTML=h;
    var tipPts=svg.querySelectorAll('.sum-pt');
    for(var qi=0;qi<tipPts.length;qi++){
      tipPts[qi].addEventListener('mousemove',function(ev){var id=this.getAttribute('data-id'),p=null;for(var si=0;si<data.points.length;si++)if(data.points[si].id===id){p=data.points[si];break}if(p)showSumTip(ev,p)});
      tipPts[qi].addEventListener('mouseleave',hideSumTip);
      tipPts[qi].addEventListener('click',function(){detail(this.getAttribute('data-id'))});
    }
  };

  var nav=document.getElementById('nav'),sumBtn=nav?nav.querySelector('[data-v="sum"]'):null;
  if(nav&&sumBtn)nav.insertBefore(sumBtn,nav.firstChild);

  var qryEl=document.getElementById('qry'); if(qryEl) qryEl.oninput=function(e){qry=e.target.value;render()};
  var mainPrimaryEl=document.getElementById('mainPrimary'); if(mainPrimaryEl){mainPrimaryEl.innerHTML=mainPrimaryOptionsHtml(mainPrimary);mainPrimaryEl.onchange=function(e){mainPrimary=e.target.value;render()}};
  var mainBenefitEl=document.getElementById('mainBenefit'); if(mainBenefitEl) mainBenefitEl.onchange=function(e){cat=e.target.value;render()};
  var srcEl=document.getElementById('srcP'); if(srcEl) srcEl.onclick=function(e){var b=e.target;if(!b.classList.contains('pl'))return;setSource(b.getAttribute('data-s'))};
  var sumSrcEl=document.getElementById('sumSrcP'); if(sumSrcEl) sumSrcEl.onclick=function(e){var b=e.target;if(!b.classList.contains('pl'))return;setSource(b.getAttribute('data-s'))};

  function showView(v){
    if(['take','tbl','wc','aiwc','met'].indexOf(v)<0) v='take';
    var bs=document.querySelectorAll('.nb');
    for(var i=0;i<bs.length;i++) bs[i].classList.toggle('on',bs[i].getAttribute('data-v')===v);
    var map={vTake:'take',vTbl:'tbl',vWc:'wc',vAiWc:'aiwc',vMet:'met'};
    for(var mid in map){ var mel=document.getElementById(mid); if(mel) mel.style.display=v===map[mid]?'':'none'; }
    if(v==='wc'&&typeof renderWC==='function') renderWC();
    if(v==='aiwc'&&typeof renderAiWc==='function') renderAiWc();
  }
  window.showView=showView;

  if(nav) nav.onclick=function(e){
    var b=e.target; if(!b.classList.contains('nb')) return;
    var v=b.getAttribute('data-v');
    (window.showView||showView)(v);
    try{ location.hash=v; }catch(err){}
  };
  var tbEl=document.getElementById('tb'); if(tbEl) tbEl.onclick=function(e){ var tr=e.target.closest('tr'); if(tr){ var id=tr.getAttribute('data-id'); if(id) detail(id); } };
  var lsTbEl=document.getElementById('lsTb'); if(lsTbEl) lsTbEl.onclick=function(e){ var tr=e.target.closest('tr'); if(tr){ var id=tr.getAttribute('data-id'); if(id) lsDetail(id); } };
  var ovEl=document.getElementById('ov'); if(ovEl) ovEl.onclick=function(e){ if(e.target===ovEl) cld(); };
  document.onkeydown=function(e){ if(e.key==='Escape') cld(); };

  window.pct=pct; window.cls=cls; window.f2=f2; window.esc=esc; window.nil=nil;
  window.fmtNum=fmtNum; window.fmtScore=fmtScore; window.fmtPct2=fmtPct2; window.fmtMoney0=fmtMoney0; window.fmtInt=fmtInt;
  window.fmtK=fmtK; window.fmtSigned2=fmtSigned2; window.baseSoc=baseSoc; window.tip=tip; window.tipDown=tipDown;
  window.scoreHue=scoreHue; window.scoreChip=scoreChip; window.trimLabel=trimLabel; window.fql=fql;
  window.OCC=OCC; window.TSK=TSK; window.LS=LS; window.SOCM=SOCM; window.LSM=LSM;
  window.src=src; window.dsrc=dsrc; window.curId=curId; window.CL=CL; window.SL=SL;
  window.lsForOcc=lsForOcc; window.upperBound=upperBound; window.pctRankSorted=pctRankSorted; window.cld=cld;

  syncSourceButtons();
  render();
  showView((location.hash||'#take').replace('#',''));
})();
/* ---- end dashboard patch ---- */

/* ---- work context + ai vs work context patch ---- */
var WC=(window.DASHBOARD_DATA&&window.DASHBOARD_DATA.WC)||[];
var WCM={};
var wcQry="",wcSort="res",wcSortDir=-1;
var WC_LABELS={
  res:"AI Resilience",
  team:"Work With or Contribute to a Work Group or Team",
  public:"Deal With External Customers or the Public in General",
  error:"Consequence of Error",
  decision:"Frequency of Decision Making",
  exact:"Importance of Being Exact or Accurate",
  lead:"Coordinate or Lead Others in Accomplishing Work Activities",
  automation:"Degree of Automation",
  repeat:"Importance of Repeating Same Tasks"
};
function wcImportanceLabel(v){
  if(nil(v))return null;
  if(v>=4.5)return 'Extremely important';
  if(v>=3.5)return 'Very important';
  if(v>=2.5)return 'Important';
  if(v>=1.5)return 'Fairly important';
  return 'Not important at all';
}
function wcSeriousnessLabel(v){
  if(nil(v))return null;
  if(v>=4.5)return 'Extremely serious';
  if(v>=3.5)return 'Very serious';
  if(v>=2.5)return 'Serious';
  if(v>=1.5)return 'Fairly serious';
  return 'Not serious at all';
}
function wcDecisionFreqLabel(v){
  if(nil(v))return null;
  if(v>=4.5)return 'Every day';
  if(v>=3.5)return 'Once a week or more but not every day';
  if(v>=2.5)return 'Once a month or more but not every week';
  if(v>=1.5)return 'Once a year or more but not every month';
  return 'Never';
}
function wcAutomationLabel(v){
  if(nil(v))return null;
  if(v>=4.5)return 'Completely automated';
  if(v>=3.5)return 'Highly automated';
  if(v>=2.5)return 'Moderately automated';
  if(v>=1.5)return 'Slightly automated';
  return 'Not automated at all';
}
function wcMetricDisplay(name,raw,fallback){
  if(nil(raw))return fallback||'—';
  var r=Number(raw),num=fmtNum(r,1),label=null;
  if(name==='Work With or Contribute to a Work Group or Team' || name==='Deal With External Customers or the Public in General' || name==='Coordinate or Lead Others in Accomplishing Work Activities' || name==='Importance of Being Exact or Accurate' || name==='Importance of Repeating Same Tasks')label=wcImportanceLabel(r);
  else if(name==='Consequence of Error')label=wcSeriousnessLabel(r);
  else if(name==='Frequency of Decision Making')label=wcDecisionFreqLabel(r);
  else if(name==='Degree of Automation')label=wcAutomationLabel(r);
  if(label)return num+' - '+label;
  if(fallback&&/^\s*\d+(?:\.\d+)?\s*-/.test(String(fallback)))return String(fallback).replace(/^\s*\d+(?:\.\d+)?/,num);
  return fallback||num;
}
function wcMetric(rec,key){
  var v=rec&&rec[key]?rec[key]:null;
  if(v&&typeof v==='object'){
    var r=nil(v.r)?null:Number(v.r);
    var name=WC_LABELS[key]||key;
    var d=wcMetricDisplay(name,r,v.d?String(v.d):(!nil(r)?fmtNum(r,1):'—'));
    return {d:d,r:r};
  }
  if(nil(v))return {d:'—',r:null};
  var num=Number(v);
  if(isFinite(num))return {d:fmtNum(num,1),r:num};
  return {d:String(v),r:null};
}
function calcWcResilience(rec){
  var keys=['team','public','error','decision','exact'],vals=[];
  for(var i=0;i<keys.length;i++){
    var m=wcMetric(rec,keys[i]);
    if(!nil(m.r))vals.push(Math.abs(m.r));
  }
  return vals.length?vals.reduce(function(a,b){return a+b},0)/vals.length:null;
}
for(var wci=0;wci<WC.length;wci++){
  var wr=WC[wci];
  if(!wr)continue;
  wr.res=calcWcResilience(wr);
  WCM[wr.id]=wr;
  var wb=baseSoc(wr.id);
  if(wb&&!WCM[wb])WCM[wb]=wr;
}
wcCols=[
  {k:"n",l:"Occupation",t:"O*NET occupation title. Click any row for full work context detail.",s:"min-width:300px"},
  {k:"primaryIndustry",l:"Primary Industry",t:"Higher-level industry grouping used for filtering in the investment tabs.",s:"min-width:180px"},
  {k:"res",l:"AI Resilience",t:"Average of the five featured work-context values.", main:true},
  {k:"team",l:"Work Group or Team",t:WC_LABELS.team},
  {k:"public",l:"External Customers/Public",t:WC_LABELS.public},
  {k:"error",l:"Consequence of Error",t:WC_LABELS.error},
  {k:"decision",l:"Decision Making",t:WC_LABELS.decision},
  {k:"exact",l:"Exact or Accurate",t:WC_LABELS.exact}
];
function wcMetricChip(m){
  if(nil(m.r))return '<span style="color:var(--t3)">'+esc(m.d)+'</span>';
  var h=scoreHue(m.r),bg='hsla('+h+',78%,55%,.12)',bd='hsla('+h+',78%,55%,.34)',tx='hsl('+h+',78%,64%)';
  return '<span style="display:inline-block;padding:4px 10px;border-radius:999px;border:1px solid '+bd+';background:'+bg+';color:'+tx+';font-size:.74rem;font-weight:600;line-height:1.35;white-space:normal">'+esc(m.d)+'</span>';
}
function wcCompare(a,b,key,dir){
  if(key==='n' || key==='primaryIndustry'){
    var va=String(key==='n'?(a.n||''):primaryIndustryForId(a.id)).toLowerCase(),vb=String(key==='n'?(b.n||''):primaryIndustryForId(b.id)).toLowerCase();
    if(va<vb)return -1*dir; if(va>vb)return 1*dir; return 0;
  }
  var av=key==='res'?a.res:wcMetric(a,key).r, bv=key==='res'?b.res:wcMetric(b,key).r;
  var an=nil(av),bn=nil(bv);
  if(an&&bn)return String(a.n||'').localeCompare(String(b.n||''));
  if(an)return 1; if(bn)return -1;
  if(av===bv)return String(a.n||'').localeCompare(String(b.n||''));
  return dir*(av-bv);
}
renderWcTh=function(){
  var h='';
  for(var i=0;i<wcCols.length;i++){
    var c=wcCols[i],isSorted=c.k===wcSort;
    var arrow=isSorted?(wcSortDir===1?' &#9650;':' &#9660;'):' &#8597;';
    h+='<th'+(c.s?' style="'+c.s+'"':'')+' class="'+(isSorted?'sorted ':'')+(c.main?'primary-col-head':'')+'" onclick="wcsort(\''+c.k+'\')">';
    h+=tipDown(c.l+'<span class="sa">'+arrow+'</span>',c.t);
    h+='</th>';
  }
  var th=document.getElementById('wcTh');
  if(th)th.querySelector('tr').innerHTML=h;
};
renderWC=function(){
  var tb=document.getElementById('wcTb');
  if(!tb)return;
  renderWcTh();
  var list=WC.slice();
  if(wcQry){var q=wcQry.toLowerCase();list=list.filter(function(o){return String(o.n||'').toLowerCase().indexOf(q)>=0||String(o.id||'').toLowerCase().indexOf(q)>=0||String(primaryIndustryForId(o.id)).toLowerCase().indexOf(q)>=0})}
  list.sort(function(a,b){return wcCompare(a,b,wcSort,wcSortDir)});
  var cnt=document.getElementById('wcCnt'); if(cnt)cnt.textContent=list.length.toLocaleString()+' occupations';
  var h='';
  for(var i=0;i<list.length;i++){
    var o=list[i];
    h+='<tr data-id="'+esc(o.id)+'" class="clickable-row" title="Click for drill-down"><td class="tn" style="white-space:normal;max-width:none"><div>'+esc(o.n)+'</div><div class="subcd">'+esc(o.id)+'</div></td>';
    h+='<td>'+esc(primaryIndustryForId(o.id))+'</td>';
    h+='<td class="primary-col-cell">'+wcMetricChip({d:fmtNum(o.res,1),r:o.res})+'</td>';
    for(var j=3;j<wcCols.length;j++)h+='<td style="font-size:.76rem;line-height:1.4">'+wcMetricChip(wcMetric(o,wcCols[j].k))+'</td>';
    h+='</tr>';
  }
  tb.innerHTML=h;
};
window.wcsort=function(col){if(wcSort===col){wcSortDir*=-1}else{wcSort=col;wcSortDir=(col==='n'||col==='primaryIndustry')?1:-1}renderWC()};
function wcDisplayRow(label,m){return '<tr><td class="tx">'+esc(label)+'</td><td class="m">'+wcMetricChip(m)+'</td></tr>'}
function wcAllMetrics(rec,excludeFeatured){
  var featuredNames={
    'Work With or Contribute to a Work Group or Team':1,
    'Deal With External Customers or the Public in General':1,
    'Consequence of Error':1,
    'Frequency of Decision Making':1,
    'Importance of Being Exact or Accurate':1
  };
  if(rec&&Array.isArray(rec.allMetrics)&&rec.allMetrics.length){
    var rows=[];
    for(var i=0;i<rec.allMetrics.length;i++){
      var a=rec.allMetrics[i]||[];
      var name=a[0],raw=a[1],disp=a[2];
      if(excludeFeatured&&featuredNames[name])continue;
      rows.push({label:name,m:{d:wcMetricDisplay(name,nil(raw)?null:Number(raw),nil(disp)?'—':String(disp)),r:nil(raw)?null:Number(raw)}});
    }
    return rows;
  }
  var order=['team','public','lead','error','decision','automation','exact','repeat'],rows=[];
  for(var j=0;j<order.length;j++){
    var k=order[j];
    if(excludeFeatured&&featuredNames[WC_LABELS[k]])continue;
    rows.push({label:WC_LABELS[k]||k,m:wcMetric(rec,k)});
  }
  return rows;
}
function buildWCDetail(id){
  var o=WCM[id]||WCM[baseSoc(id)]||null;
  if(!o)return '';
  var title=o.n||((function(){for(var i=0;i<OCC.length;i++)if(OCC[i].id===id)return OCC[i].n;return id})());
  var h='<button class="x" id="xb">&times;</button>';
  h+='<div class="dt">'+esc(title)+'</div>';
  h+='<div class="dc">'+esc(id)+' &middot; Work Context drill-down</div>';
  h+=buildSocDescBox(id,'Job description');
  h+='<div class="sc-row">';
  h+='<div class="sc-box"><div class="lb">AI Resilience</div><div class="vl">'+wcMetricChip({d:fmtNum(o.res,1),r:o.res})+'</div><div class="mt">Average of the five featured work-context values</div></div>';
  h+='<div class="sc-box"><div class="lb">Work Group or Team</div><div class="vl" style="font-size:1rem">'+wcMetricChip(wcMetric(o,'team'))+'</div></div>';
  h+='<div class="sc-box"><div class="lb">External Customers/Public</div><div class="vl" style="font-size:1rem">'+wcMetricChip(wcMetric(o,'public'))+'</div></div>';
  h+='<div class="sc-box"><div class="lb">Consequence of Error</div><div class="vl" style="font-size:1rem">'+wcMetricChip(wcMetric(o,'error'))+'</div></div>';
  h+='<div class="sc-box"><div class="lb">Decision Making</div><div class="vl" style="font-size:1rem">'+wcMetricChip(wcMetric(o,'decision'))+'</div></div>';
  h+='<div class="sc-box"><div class="lb">Exact or Accurate</div><div class="vl" style="font-size:1rem">'+wcMetricChip(wcMetric(o,'exact'))+'</div></div>';
  h+='</div>';
  var allRows=wcAllMetrics(o,true);
  h+='<div class="sct">All Other Work Context Scores</div><div class="scs">These are the additional work-context measures available for this occupation in the loaded workbook.</div>';
  h+='<div style="overflow-x:auto;border:1px solid var(--b1);border-radius:var(--r);margin-bottom:16px"><table class="tt"><thead><tr><th>Metric</th><th>Value</th></tr></thead><tbody>';
  for(var i=0;i<allRows.length;i++)h+=wcDisplayRow(allRows[i].label,allRows[i].m);
  h+='</tbody></table></div>';
  h+='<div class="contact-note pnl-contact-note"><strong>Questions?</strong> Please direct any questions to Wilson Zhang at <a href="mailto:wilson.z1015@gmail.com" style="color:var(--blue);text-decoration:none">wilson.z1015@gmail.com</a> / <a href="https://www.linkedin.com/in/wilsonzhang10/" target="_blank" rel="noopener" style="color:var(--blue);text-decoration:none">https://www.linkedin.com/in/wilsonzhang10/</a>.</div>';
  return h;
}
function wcDetail(id){var pnl=document.getElementById('pnl'); if(!pnl)return; pnl.innerHTML=buildWCDetail(id); document.getElementById('ov').classList.add('open'); document.body.style.overflow='hidden'; var xb=document.getElementById('xb'); if(xb)xb.onclick=cld}
window.wcDetail=wcDetail;
function buildAiWcData(){
  var pts=[];
  for(var i=0;i<OCC.length;i++){
    var o=OCC[i],d=o[src],w=WCM[o.id]||WCM[baseSoc(o.id)];
    if(!d||nil(d.s)||!w||nil(w.res))continue;
    pts.push({id:o.id,n:o.n,base:baseSoc(o.id),x:d.s,y:w.res,auto:d.au,aug:d.ag,cat:d.ct,wc:w});
  }
  var xs=[],ys=[];
  for(var j=0;j<pts.length;j++){xs.push(pts[j].x);ys.push(pts[j].y)}
  xs.sort(function(a,b){return a-b}); ys.sort(function(a,b){return a-b});
  for(var k=0;k<pts.length;k++){
    pts[k].xp=pctRankSorted(xs,pts[k].x);
    pts[k].yp=pctRankSorted(ys,pts[k].y);
    pts[k].benefit=pts[k].x>0?(pts[k].xp+pts[k].yp):-999;
    pts[k].suffer=pts[k].x<0?((1-pts[k].xp)+(1-pts[k].yp)):-999;
  }
  var benefit=pts.filter(function(p){return p.x>0}).slice().sort(function(a,b){return b.benefit-a.benefit||b.x-a.x||b.y-a.y}).slice(0,20);
  var suffer=pts.filter(function(p){return p.x<0}).slice().sort(function(a,b){return b.suffer-a.suffer||a.x-b.x||a.y-b.y}).slice(0,20);
  var marks={};
  for(var bi=0;bi<benefit.length;bi++)marks[benefit[bi].id]={kind:'benefit',rank:bi+1};
  for(var si=0;si<suffer.length;si++)marks[suffer[si].id]={kind:'suffer',rank:si+1};
  var medianY=ys.length?(ys.length%2?ys[(ys.length-1)/2]:(ys[ys.length/2-1]+ys[ys.length/2])/2):3;
  return {points:pts,benefit:benefit,suffer:suffer,marks:marks,medianY:medianY};
}
function makeAiWcList(arr,kind){
  function headCell(label,tip,extraCls){return '<div class="cell'+(extraCls?' '+extraCls:'')+'" title="'+esc(tip)+'"><span class="tip-label">'+esc(label)+'</span></div>'}
  var sumTip=kind==='benefit'
    ? 'AI percentile plus Work Context resilience percentile. Higher values indicate occupations that rank more strongly on both AI upside and work-context resilience.'
    : 'AI percentile plus Work Context resilience percentile. Lower values indicate occupations with more downside exposure; this table is ordered from the lowest combined percentiles upward.';
  var h='<div class="sum-list-head">'+headCell('#','Rank within this top-20 list.')+headCell('Occupation','Occupation title from O*NET.')+headCell('AI score','Net AI augmentation vs. automation score.','num')+headCell('AI percentile','Percentile rank of the AI score across plotted occupations.','num')+headCell('AI Resilience','Average of the five featured work-context values.','num')+headCell('Resilience percentile','Percentile rank of the AI Resilience score across plotted occupations.','num')+headCell('Sum of percentiles',sumTip,'num')+'</div>';
  for(var i=0;i<arr.length;i++){
    var p=arr[i],sumVal=p.xp+p.yp,sumCls=kind==='benefit'?'p':'n',aiCls=p.x>0?'p':p.x<0?'n':'z';
    h+='<div class="sum-item" data-id="'+p.id+'"><div class="cell rk">'+(i+1)+'</div><div class="cell nm">'+esc(p.n)+'</div><div class="cell num m '+aiCls+'">'+fmtSigned2(p.x)+'</div><div class="cell num m pctv">'+pct(p.xp)+'</div><div class="cell num">'+scoreChip(p.y)+'</div><div class="cell num m pctv">'+pct(p.yp)+'</div><div class="cell num m sumv '+sumCls+'">'+f2(sumVal)+'</div></div>';
  }
  return h;
}
function showAiWcTip(ev,p){
  var tip=document.getElementById('aiwcTip'),card=document.getElementById('aiwcCard');
  if(!tip||!card)return;
  tip.innerHTML='<b>'+esc(p.n)+'</b><br><span style="font-family:IBM Plex Mono,monospace;color:var(--t4)">'+p.id+' &middot; SOC '+p.base+'</span><br>AI score: <span class="'+(p.x>0?'p':p.x<0?'n':'z')+'">'+fmtSigned2(p.x)+'</span><br>AI Resilience: '+fmtNum(p.y,2)+'<br>Automation: '+pct(p.auto)+' &middot; Augmentation: '+pct(p.aug)+'<br>Click to open the Work Context drill-down';
  tip.style.display='block';
  var rect=card.getBoundingClientRect();
  var x=ev.clientX-rect.left+14,y=ev.clientY-rect.top+14;
  x=Math.min(x,rect.width-330); y=Math.min(y,rect.height-120);
  if(x<10)x=10; if(y<10)y=10;
  tip.style.left=x+'px'; tip.style.top=y+'px';
}
function hideAiWcTip(){var tip=document.getElementById('aiwcTip'); if(tip)tip.style.display='none'}
function renderAiWc(){
  var svg=document.getElementById('aiwcSvg');
  if(!svg) return;
  var data=buildAiWcData();
  var note=document.getElementById('aiwcNote');
  if(note) note.textContent='Horizontal axis = AI augmentation vs. automation score. Vertical axis = AI Resilience. Hover any point for the occupation, and click a point to open the AI Resilience drill-down.';
  var ben=document.getElementById('aiwcBenefit'),suf=document.getElementById('aiwcSuffer');
  if(ben) ben.innerHTML=makeAiWcList(data.benefit,'benefit');
  if(suf) suf.innerHTML=makeAiWcList(data.suffer,'suffer');
  var W=1200,H=620,L=160,R=1040,T=34,B=542,PW=R-L,PH=B-T;
  var absRaw=1; for(var i=0;i<data.points.length;i++) absRaw=Math.max(absRaw,Math.abs(data.points[i].x));
  var absX=Math.ceil(absRaw*1.1); if(absX<5) absX=5;
  var xMin=-absX,xMax=absX,yMin=2,yMax=5;
  function xScale(v){ return L+(v-xMin)/(xMax-xMin)*PW; }
  function yScale(v){ return T+(yMax-v)/(yMax-yMin)*PH; }
  function clamp(v,min,max){ return Math.max(min,Math.min(max,v)); }
  function axisLabel(v){ var av=Math.abs(v),s=av>=10?String(Math.round(v)):String(Math.round(v*10)/10); return s.replace(/\.0$/,''); }
  function escAttr(s){ return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function trimText(s,n){ s=String(s||''); return s.length>n?s.slice(0,n-1)+'…':s; }
  function intersects(a,b){ return !(a.x2<b.x1 || a.x1>b.x2 || a.y2<b.y1 || a.y1>b.y2); }
  var x0=xScale(0),yMidVal=3.5,yMid=yScale(yMidVal);
  var h='';
  h+='<defs><marker id="quadArrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="rgba(255,255,255,.28)"/></marker></defs>';
  h+='<rect x="0" y="0" width="'+W+'" height="'+H+'" fill="transparent"/>';
  h+='<rect x="'+L+'" y="'+T+'" width="'+(x0-L)+'" height="'+(yMid-T)+'" fill="rgba(251,191,36,.04)"/>';
  h+='<rect x="'+x0+'" y="'+T+'" width="'+(R-x0)+'" height="'+(yMid-T)+'" fill="rgba(52,211,153,.05)"/>';
  h+='<rect x="'+L+'" y="'+yMid+'" width="'+(x0-L)+'" height="'+(B-yMid)+'" fill="rgba(248,113,113,.05)"/>';
  h+='<rect x="'+x0+'" y="'+yMid+'" width="'+(R-x0)+'" height="'+(B-yMid)+'" fill="rgba(76,154,255,.04)"/>';
  for(var y=2;y<=5;y++){ var yy=yScale(y); h+='<text x="'+(L-12)+'" y="'+(yy+4)+'" fill="var(--t4)" font-size="12" text-anchor="end">'+y+'</text>'; }
  var xticks=[xMin,xMin/2,0,xMax/2,xMax];
  for(var xt=0;xt<xticks.length;xt++){ var xv=xticks[xt],xx=xScale(xv); h+='<text x="'+xx+'" y="'+(B+22)+'" fill="var(--t4)" font-size="12" text-anchor="middle">'+axisLabel(xv)+'</text>'; }
  h+='<line x1="'+L+'" y1="'+yMid+'" x2="'+R+'" y2="'+yMid+'" stroke="rgba(255,255,255,.18)" stroke-width="1.4"/>';
  h+='<line x1="'+x0+'" y1="'+T+'" x2="'+x0+'" y2="'+B+'" stroke="rgba(255,255,255,.18)" stroke-width="1.4"/>';
  h+='<rect x="'+L+'" y="'+T+'" width="'+PW+'" height="'+PH+'" fill="none" stroke="rgba(255,255,255,.14)" stroke-width="1"/>';
  h+='<text x="'+(L+16)+'" y="'+(T+18)+'" fill="rgba(251,191,36,.9)" font-size="12" font-weight="700">Automation usage but occupation is resilient to AI</text>';
  h+='<text x="'+(R-16)+'" y="'+(T+18)+'" fill="rgba(52,211,153,.95)" font-size="12" font-weight="700" text-anchor="end">Benefit from AI</text>';
  h+='<text x="'+(L+16)+'" y="'+(B-14)+'" fill="rgba(248,113,113,.95)" font-size="12" font-weight="700">Suffer most from AI</text>';
  h+='<text x="'+(R-16)+'" y="'+(B-14)+'" fill="rgba(76,154,255,.95)" font-size="12" font-weight="700" text-anchor="end">Augmentation usage but AI displacement risk remains</text>';
  h+='<text x="'+((L+R)/2)+'" y="'+(H-18)+'" fill="var(--t3)" font-size="13" text-anchor="middle">AI augmentation vs. automation score</text>';
  h+='<text x="'+(L+6)+'" y="'+(H-36)+'" fill="var(--red)" font-size="12">More automation risk</text>';
  h+='<text x="'+(R-6)+'" y="'+(H-36)+'" fill="var(--grn)" font-size="12" text-anchor="end">More augmentation gain</text>';
  h+='<text transform="translate(32 '+((T+B)/2)+') rotate(-90)" fill="var(--t3)" font-size="13" text-anchor="middle">AI Resilience</text>';
  for(var pi=0;pi<data.points.length;pi++){
    var p=data.points[pi],mark=data.marks[p.id],cx=xScale(p.x),cy=clamp(yScale(p.y),T,B),fill=((p.x<0&&p.y>=yMidVal)||(p.x>0&&p.y<yMidVal))?'#fbbf24':(p.x>0?'#34d399':p.x<0?'#f87171':'#a8b8cc'),op=mark?.95:.33,r=mark?5.6:3.2;
    p.cx=cx; p.cy=cy;
    h+='<circle class="aiwc-pt" data-id="'+escAttr(p.id)+'" cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="'+fill+'" fill-opacity="'+op+'" stroke="'+fill+'" stroke-opacity="'+(mark?.55:.18)+'" stroke-width="'+(mark?1.6:1)+'" style="cursor:pointer" />';
  }
  var taken=[];
  var sideLeft=[], sideRight=[];
  var labels=data.benefit.concat(data.suffer);
  labels.sort(function(a,b){
    var ra=(data.marks[a.id]&&data.marks[a.id].rank)||999, rb=(data.marks[b.id]&&data.marks[b.id].rank)||999;
    return ra-rb;
  });
  for(var li=0;li<labels.length;li++){
    var p=labels[li], txt=trimText(p.n,24), w=Math.max(48,txt.length*5.2), hBox=12;
    var fill=p.x>0?'rgba(52,211,153,.98)':'rgba(248,113,113,.98)';
    var candidates=[
      {mode:'inside', anchor:'start', tx:p.cx+8, ty:p.cy-3, x1:p.cx+6, x2:p.cx+6+w, y1:p.cy-10, y2:p.cy+2},
      {mode:'inside', anchor:'end', tx:p.cx-8, ty:p.cy-3, x1:p.cx-8-w, x2:p.cx-8, y1:p.cy-10, y2:p.cy+2},
      {mode:'inside', anchor:'middle', tx:p.cx, ty:p.cy-10, x1:p.cx-w/2, x2:p.cx+w/2, y1:p.cy-18, y2:p.cy-6},
      {mode:'inside', anchor:'middle', tx:p.cx, ty:p.cy+14, x1:p.cx-w/2, x2:p.cx+w/2, y1:p.cy+4, y2:p.cy+16}
    ];
    var placed=null;
    for(var ci=0;ci<candidates.length;ci++){
      var c=candidates[ci];
      if(c.x1<L+8 || c.x2>R-8 || c.y1<T+8 || c.y2>B-8) continue;
      var overlap=false;
      for(var ti=0;ti<taken.length;ti++) if(intersects(c,taken[ti])) { overlap=true; break; }
      if(!overlap){ placed=c; break; }
    }
    if(placed){ placed.text=txt; placed.fill=fill; taken.push(placed); p._label=placed; }
    else { (p.x>=0?sideRight:sideLeft).push({p:p,text:txt,fill:fill}); }
  }
  function assignSide(items, side){
    items.sort(function(a,b){ return a.p.cy-b.p.cy; });
    var top=T+18,bottom=B-8,gap=15,last=top-gap;
    for(var i=0;i<items.length;i++){
      var y=Math.max(top,Math.min(bottom,items[i].p.cy));
      if(y<last+gap) y=last+gap;
      items[i].y=Math.min(y,bottom);
      last=items[i].y;
    }
    for(var j=items.length-2;j>=0;j--){
      if(items[j].y>items[j+1].y-gap) items[j].y=items[j+1].y-gap;
      if(items[j].y<top) items[j].y=top;
    }
    for(var k=0;k<items.length;k++){
      var it=items[k], tx=side==='right'?R+28:L-28;
      var anchor=side==='right'?'start':'end';
      var lx=side==='right'?R+8:L-8;
      h+='<line class="quad-connector" x1="'+it.p.cx+'" y1="'+it.p.cy+'" x2="'+lx+'" y2="'+it.y+'" />';
      h+='<text x="'+tx+'" y="'+(it.y+3.5)+'" fill="'+it.fill+'" font-size="9.25" font-weight="600" text-anchor="'+anchor+'" paint-order="stroke" stroke="rgba(7,9,15,.96)" stroke-width="2.4" stroke-linejoin="round" style="pointer-events:none">'+esc(it.text)+'</text>';
    }
  }
  for(var ti=0;ti<taken.length;ti++){
    var t=taken[ti];
    h+='<text x="'+t.tx+'" y="'+t.ty+'" fill="'+t.fill+'" font-size="9.25" font-weight="600" text-anchor="'+t.anchor+'" paint-order="stroke" stroke="rgba(7,9,15,.96)" stroke-width="2.4" stroke-linejoin="round" style="pointer-events:none">'+esc(t.text)+'</text>';
  }
  assignSide(sideRight,'right');
  assignSide(sideLeft,'left');
  svg.innerHTML=h;
  var tipPts=svg.querySelectorAll('.aiwc-pt');
  for(var qi=0;qi<tipPts.length;qi++){
    tipPts[qi].addEventListener('mousemove',function(ev){var id=this.getAttribute('data-id'),p=null;for(var si=0;si<data.points.length;si++)if(data.points[si].id===id){p=data.points[si];break}if(p)showAiWcTip(ev,p)});
    tipPts[qi].addEventListener('mouseleave',hideAiWcTip);
    tipPts[qi].addEventListener('click',function(){wcDetail(this.getAttribute('data-id'))});
  }
}

var wcQryEl=document.getElementById('wcQry'); if(wcQryEl)wcQryEl.oninput=function(e){wcQry=e.target.value;renderWC()};
var wcTbEl=document.getElementById('wcTb'); if(wcTbEl)wcTbEl.onclick=function(e){var tr=e.target.closest('tr');if(tr){var id=tr.getAttribute('data-id');if(id)wcDetail(id)}};
var aiwcBen=document.getElementById('aiwcBenefit'); if(aiwcBen)aiwcBen.onclick=function(e){var it=e.target.closest('.sum-item');if(it)wcDetail(it.getAttribute('data-id'))};
var aiwcSuf=document.getElementById('aiwcSuffer'); if(aiwcSuf)aiwcSuf.onclick=function(e){var it=e.target.closest('.sum-item');if(it)wcDetail(it.getAttribute('data-id'))};
renderWC();
renderAiWc();
showView((location.hash||'#tbl').replace('#',''));


/* ---- end work context + ai vs work context patch ---- */

/* ---- v6 clean override: work-context drill-down refresh + standardized AI vs WC ---- */
(function(){
  function v6TaskRawScore(raw){
    if(!raw || raw[6]!==1 || !raw[7]) return 0;
    var imp=Number(raw[1])||0, auto=Number(raw[7][1])||0, aug=Number(raw[7][2])||0;
    return 100 * (aug - auto) * ((imp - 1) / 4);
  }
  function effectiveHumanTask(raw,occId){
    return !!raw[5] || raw[raw.length-1]===1;
  }
  function hasClassifiedAiSignal(t){
    return (Number(t.d)||0)>0 || (Number(t.fb)||0)>0 || (Number(t.ti)||0)>0 || (Number(t.v)||0)>0 || (Number(t.l)||0)>0;
  }
  function hasDisplayedNonZeroScore(v){
    var n=Number(v)||0;
    return Math.abs(Math.round(n*10)/10)>0;
  }
  function taskPct(v){
    var n=Number(v)||0, s=n.toFixed(1).replace(/\.0$/,'');
    return s+'%';
  }
  function parseTask(raw,occId){
    var o={tk:raw[0],im:raw[1],rl:raw[2],fa:raw[3],fw:raw[4],origHu:!!raw[5],hu:effectiveHumanTask(raw,occId),ai:raw[6]};
    if(raw[6]===1 && raw[7]){
      var a=raw[7], sc=v6TaskRawScore(raw);
      o.e=Number(a[0])||0; o.au=Number(a[1])||0; o.ag=Number(a[2])||0; o.rawSc=sc; o.sc=o.hu?0:sc;
      o.d=Number(a[4])||0; o.fb=Number(a[5])||0; o.ti=Number(a[6])||0; o.v=Number(a[7])||0; o.l=Number(a[8])||0; o.u=Number(a[9])||0;
      o.ta=Math.max(0,Math.round((o.ti+o.v+o.l)*10)/10);
    }else{
      o.e=0;o.au=0;o.ag=0;o.rawSc=0;o.sc=0;o.d=0;o.fb=0;o.ti=0;o.v=0;o.l=0;o.u=0;o.ta=0;
    }
    return o;
  }
  function isScoreEligibleAiTask(t){
    return t.ai===1 && !t.hu && hasClassifiedAiSignal(t) && hasDisplayedNonZeroScore(t.sc);
  }
  window.isScoreEligibleAiTask=isScoreEligibleAiTask;
  function occAdjusted(id){
    var tasks=TSK[id]||[], ai=0, sum=0, au=0, ag=0;
    for(var i=0;i<tasks.length;i++){
      var obj=parseTask(tasks[i], id);
      if(!isScoreEligibleAiTask(obj)) continue;
      ai++;
      sum += obj.sc * (Number(tasks[i][4])||0) / 100;
      au += obj.au;
      ag += obj.ag;
    }
    var cv=tasks.length?ai/tasks.length:0;
    if(ai){ au/=ai; ag/=ai; } else { au=0; ag=0; }
    var sparse=(ai<=1) || (cv<0.101);
    var s=sparse?0:(Math.abs(sum)>1e-12?sum:0);
    return {ai:ai, cv:cv, au:au, ag:ag, s:s, sparse:sparse, ct:s>0?'B':s<0?'R':'N'};
  }
  function sortAiTasks(rawTasks,occId){
    var parsed=[];
    for(var i=0;i<rawTasks.length;i++) parsed.push(parseTask(rawTasks[i],occId));
    parsed.sort(function(a,b){
      var ba=isScoreEligibleAiTask(a)?0:(a.ai===1&&a.hu?1:2), bb=isScoreEligibleAiTask(b)?0:(b.ai===1&&b.hu?1:2);
      if(ba!==bb) return ba-bb;
      if(ba===0 && a.sc!==b.sc) return b.sc-a.sc;
      if(ba===1){
        var ah=Math.abs(a.rawSc||0), bh=Math.abs(b.rawSc||0);
        if(ah!==bh) return bh-ah;
      }
      return String(a.tk||'').localeCompare(String(b.tk||''));
    });
    return parsed;
  }

  WC_LABELS.contact = 'Contact With Others';
  WC_LABELS.impact = 'Impact of Decisions on Co-workers or Company Results';

  function findAllMetric(rec, label){
    if(rec && Array.isArray(rec.allMetrics)){
      for(var i=0;i<rec.allMetrics.length;i++){
        var row=rec.allMetrics[i]||[];
        if(row[0]===label){
          var raw=nil(row[1])?null:Number(row[1]);
          var disp=nil(row[2])?(!nil(raw)?fmtNum(raw,1):'—'):String(row[2]);
          return {d:disp,r:raw};
        }
      }
    }
    return {d:'—',r:null};
  }
  function ensureWcMetric(rec,key,label){
    if(!rec) return;
    if(rec[key] && typeof rec[key]==='object') return;
    rec[key]=findAllMetric(rec,label);
  }
  calcWcResilience = function(rec){
    ensureWcMetric(rec,'contact','Contact With Others');
    ensureWcMetric(rec,'impact','Impact of Decisions on Co-workers or Company Results');
    var keys=['contact','error','impact','exact'], vals=[];
    for(var i=0;i<keys.length;i++){
      var m=wcMetric(rec,keys[i]);
      if(!nil(m.r)) vals.push(Math.abs(Number(m.r)));
    }
    return vals.length?vals.reduce(function(a,b){return a+b},0)/vals.length:null;
  };
  function refreshWcSummaries(){
    WCM={};
    for(var i=0;i<WC.length;i++){
      var rec=WC[i];
      if(!rec) continue;
      ensureWcMetric(rec,'contact','Contact With Others');
      ensureWcMetric(rec,'impact','Impact of Decisions on Co-workers or Company Results');
      rec.res=calcWcResilience(rec);
      WCM[rec.id]=rec;
      var base=baseSoc(rec.id);
      if(base && !WCM[base]) WCM[base]=rec;
    }
  }
  wcCols=[
    {k:'n',l:'Occupation',t:'O*NET occupation title. Click any row for full work context detail.',s:'min-width:300px'},
    {k:'primaryIndustry',l:'Primary Industry',t:'Higher-level industry grouping used for filtering in the investment tabs.',s:'min-width:180px'},
    {k:'res',l:'AI Resilience',t:'Average of the five featured work-context values.', main:true},
    {k:'team',l:'Work Group or Team',t:WC_LABELS.team},
    {k:'public',l:'External Customers/Public',t:WC_LABELS.public},
    {k:'error',l:'Consequence of Error',t:WC_LABELS.error},
    {k:'decision',l:'Decision Making',t:WC_LABELS.decision},
    {k:'exact',l:'Exact or Accurate',t:WC_LABELS.exact}
  ];

  function buildAiOnlyTaskTable(id){
    var raw=TSK[id]||[], aiRaw=[];
    for(var i=0;i<raw.length;i++) if(raw[i][6]===1) aiRaw.push(raw[i]);
    if(!aiRaw.length) return '<div class="sct" style="color:var(--t4);margin-top:12px">No AI-exposed tasks.</div>';
    var tasks=sortAiTasks(aiRaw,id);
    var h='<div class="sct">AI-exposed tasks ('+tasks.length+' total)</div>';
    h+='<div class="scs">Only tasks with AI interaction data are shown below. Human / physical tasks remain listed, but their displayed AI score is forced to 0 because the task itself still requires physical presence or face-to-face execution.</div>';
    h+='<div style="overflow-x:auto;border:1px solid var(--b1);border-radius:var(--r)"><table class="tt"><thead>';
    h+='<tr><th colspan="4" style="border-right:1px solid var(--b2)">Task Details</th>';
    h+='<th colspan="2" style="border-right:1px solid var(--b2)">Scores</th>';
    h+='<th colspan="3" class="cg-auto" style="border-right:1px solid var(--b2);text-align:center">Automation (Dir + FB)</th>';
    h+='<th colspan="4" class="cg-aug" style="border-right:1px solid var(--b2);text-align:center">Augmentation (TI + Val + Lrn)</th>';
    h+='<th>Other</th></tr><tr>';
    var cols=[['tk','Task'],['im','Imp'],['fa','Freq'],['fw','FW%'],['sc','Score'],['au','A/A%'],['d','Dir%'],['fb','FB%'],['auto','Tot Auto%'],['ti','TI%'],['v','Val%'],['l','Lrn%'],['ta','Tot Aug%'],['u','Unc%']];
    for(var ci=0;ci<cols.length;ci++){
      var c=cols[ci], extra='';
      if(c[0]==='fw' || c[0]==='au' || c[0]==='auto' || c[0]==='ta') extra=' style="border-right:1px solid var(--b2)"';
      var cls2='';
      if(c[0]==='d' || c[0]==='fb' || c[0]==='auto') cls2=' class="cg-auto"';
      if(c[0]==='ti' || c[0]==='v' || c[0]==='l' || c[0]==='ta') cls2=' class="cg-aug"';
      h+='<th'+cls2+extra+'>'+c[1]+'</th>';
    }
    h+='</tr></thead><tbody>';
    for(var j=0;j<tasks.length;j++){
      var t=tasks[j], hfl=t.hu?'<span class="hf">[human / physical]</span>':'';
      h+='<tr class="'+(t.hu?'human-row':'')+'"><td class="tx">'+esc(t.tk)+hfl+'</td>';
      h+='<td class="m">'+t.im+'</td><td class="fl">'+fql(t.fa)+'</td><td class="m" style="border-right:1px solid var(--b2)">'+t.fw+'%</td>';
      h+='<td class="m '+cls(t.sc)+'">'+(Math.round(t.sc*10)/10).toFixed(1)+'</td>';
      h+='<td style="border-right:1px solid var(--b2)"><div style="display:flex;height:7px;border-radius:4px;overflow:hidden;min-width:50px"><div style="width:'+pct(t.au)+';background:var(--red)"></div><div style="width:'+pct(t.ag)+';background:var(--grn)"></div></div></td>';
      h+='<td class="m n">'+taskPct(t.d)+'</td><td class="m n">'+taskPct(t.fb)+'</td><td class="m n" style="border-right:1px solid var(--b2);font-weight:600">'+pct(t.au)+'</td>';
      h+='<td class="m p">'+taskPct(t.ti)+'</td><td class="m p">'+taskPct(t.v)+'</td><td class="m p">'+taskPct(t.l)+'</td><td class="m p" style="border-right:1px solid var(--b2);font-weight:600">'+taskPct(t.ta)+'</td>';
      h+='<td class="m z">'+taskPct(t.u)+'</td></tr>';
    }
    h+='</tbody></table></div>';
    return h;
  }

  buildWCDetail = function(id){
    var o=WCM[id]||WCM[baseSoc(id)]||null;
    if(!o) return '';
    var occ=null; for(var i=0;i<OCC.length;i++){ if(OCC[i].id===id){ occ=OCC[i]; break; } }
    var title=(o&&o.n) || (occ&&occ.n) || id;
    var occStats=occ?occAdjusted(occ.id):null;
    var totalTasks=occ?occ.t:((TSK[id]||[]).length||0);
    var h='<button class="x" id="xb">&times;</button>';
    h+='<div class="dt">'+esc(title)+'</div>';
    h+='<div class="dc">'+esc(id)+' &middot; Occupation drill-down</div>';
    h+=(window.buildSocDescBox?window.buildSocDescBox(id,'Job description'):'');
    h+='<div class="sct" style="margin-top:12px">AI Resilience (Work Context)</div>';
    h+='<div class="scs">These cards summarize the O*NET work-context measures that roll up into the resilience score.</div>';
    h+='<div class="sc-row">';
    h+='<div class="sc-box"><div class="lb">AI Resilience</div><div class="vl">'+wcMetricChip({d:fmtNum(o.res,1),r:o.res})+'</div><div class="mt">Average of the 4 featured work-context values</div></div>';
    h+='<div class="sc-box"><div class="lb">Contact With Others</div><div class="vl" style="font-size:1rem">'+wcMetricChip(wcMetric(o,'contact'))+'</div></div>';
    h+='<div class="sc-box"><div class="lb">Consequence of Error</div><div class="vl" style="font-size:1rem">'+wcMetricChip(wcMetric(o,'error'))+'</div></div>';
    h+='<div class="sc-box"><div class="lb">Impact of Decisions</div><div class="vl" style="font-size:1rem">'+wcMetricChip(wcMetric(o,'impact'))+'</div></div>';
    h+='<div class="sc-box"><div class="lb">Exact or Accurate</div><div class="vl" style="font-size:1rem">'+wcMetricChip(wcMetric(o,'exact'))+'</div></div>';
    h+='</div>';
    if(occStats){
      h+='<div class="sct" style="margin-top:12px">AI Augmentation Score</div>';
      h+='<div class="scs">These cards summarize the occupation\'s AI score, AI coverage, and the augmentation-vs.-automation split used in the dashboard.</div>';
      h+='<div class="sc-row">';
      h+='<div class="sc-box"><div class="lb">AI Score (Chat)</div><div class="vl '+cls(occStats.s)+'">'+f2(occStats.s)+'</div><div class="mt"><span class="bg '+occStats.ct+'" style="font-size:.6rem;padding:1px 7px">'+CL[occStats.ct]+'</span></div></div>';
      h+='<div class="sc-box"><div class="lb">AI Coverage</div><div class="vl" style="font-size:1.4rem">'+occStats.ai+' <span style="font-size:.9rem;color:var(--t3)">/ '+totalTasks+'</span></div><div class="mt">'+pct(occStats.cv)+' coverage</div></div>';
      h+='<div class="sc-box"><div class="lb">Automation vs Augmentation</div><div style="margin-top:8px"><div class="br"><div class="bl">Auto</div><div class="bt"><div class="bfa" style="width:'+pct(occStats.au)+'"></div></div><div class="bv n">'+pct(occStats.au)+'</div></div><div class="br"><div class="bl">Aug</div><div class="bt"><div class="bfg" style="width:'+pct(occStats.ag)+'"></div></div><div class="bv p">'+pct(occStats.ag)+'</div></div></div></div>';
      h+='</div>';
      if(occStats.sparse) h+='<div class="scs" style="margin-top:10px;color:var(--t3)">Occupation AI score shown as 0 because this occupation has only '+occStats.ai+' score-eligible AI task'+(occStats.ai===1?'':'s')+' and/or '+pct(occStats.cv)+' AI coverage, which is below the dashboard minimum evidence threshold.</div>';
      h+=buildAiOnlyTaskTable(id);
    }
    h+='<div class="contact-note pnl-contact-note"><strong>Questions?</strong> Please direct any questions to Wilson Zhang at <a href="mailto:wilson.z1015@gmail.com" style="color:var(--blue);text-decoration:none">wilson.z1015@gmail.com</a> / <a href="https://www.linkedin.com/in/wilsonzhang10/" target="_blank" rel="noopener" style="color:var(--blue);text-decoration:none">https://www.linkedin.com/in/wilsonzhang10/</a>.</div>';
    return h;
  };
  wcDetail = function(id){ var pnl=document.getElementById('pnl'); if(!pnl)return; pnl.innerHTML=buildWCDetail(id); document.getElementById('ov').classList.add('open'); document.body.style.overflow='hidden'; var xb=document.getElementById('xb'); if(xb)xb.onclick=cld; };

  function mean(arr){ var s=0; for(var i=0;i<arr.length;i++) s+=arr[i]; return arr.length?s/arr.length:0; }
  function sd(arr,m){ if(arr.length<2) return 0; var s=0; for(var i=0;i<arr.length;i++){ var d=arr[i]-m; s+=d*d; } return Math.sqrt(s/arr.length); }
  buildAiWcData = function(){
    var pts=[];
    for(var i=0;i<OCC.length;i++){
      var o=OCC[i], d=occAdjusted(o.id), w=WCM[o.id]||WCM[baseSoc(o.id)];
      if(nil(d.s) || !w || nil(w.res)) continue;
      pts.push({id:o.id,n:o.n,base:baseSoc(o.id),x:d.s,y:w.res,auto:d.au,aug:d.ag,cat:d.ct,wc:w});
    }
    var xs=[], ys=[];
    for(var j=0;j<pts.length;j++){ xs.push(pts[j].x); ys.push(pts[j].y); }
    var mx=mean(xs), my=mean(ys), sdx=sd(xs,mx), sdy=sd(ys,my);
    for(var k=0;k<pts.length;k++){
      pts[k].xz=sdx?(pts[k].x-mx)/sdx:0;
      pts[k].yz=sdy?(pts[k].y-my)/sdy:0;
      pts[k].cz=pts[k].xz+pts[k].yz;
    }
    var benefit=pts.slice().sort(function(a,b){return b.cz-a.cz||b.x-a.x||b.y-a.y}).slice(0,20);
    var suffer=pts.slice().sort(function(a,b){return a.cz-b.cz||a.x-b.x||a.y-b.y}).slice(0,20);
    var marks={};
    for(var bi=0;bi<benefit.length;bi++) marks[benefit[bi].id]={kind:'benefit',rank:bi+1};
    for(var si=0;si<suffer.length;si++) if(!marks[suffer[si].id]) marks[suffer[si].id]={kind:'suffer',rank:si+1};
    var ys2=ys.slice().sort(function(a,b){return a-b});
    var medianY=ys2.length?(ys2.length%2?ys2[(ys2.length-1)/2]:(ys2[ys2.length/2-1]+ys2[ys2.length/2])/2):3;
    return {points:pts,benefit:benefit,suffer:suffer,marks:marks,medianY:medianY};
  };
  makeAiWcList = function(arr){
    function headCell(label,tip,extraCls){return '<div class="cell'+(extraCls?' '+extraCls:'')+'" title="'+esc(tip)+'"><span class="tip-label">'+esc(label)+'</span></div>'}
    var h='<div class="sum-list-head">'
      + headCell('#','Rank within this top-20 list.')
      + headCell('Occupation','Occupation title from O*NET.')
      + headCell('AI score','Net AI augmentation vs. automation score.','num')
      + headCell('AI z','Standardized AI score across plotted occupations.','num')
      + headCell('AI Resilience','Average of the four featured work-context values.','num')
      + headCell('Resilience z','Standardized resilience score across plotted occupations.','num')
      + headCell('Combined z','AI z-score plus resilience z-score.','num')
      + '</div>';
    for(var i=0;i<arr.length;i++){
      var p=arr[i], aiCls=p.x>0?'p':p.x<0?'n':'z', combCls=p.cz>0?'p':p.cz<0?'n':'z';
      h+='<div class="sum-item" data-id="'+p.id+'"><div class="cell rk">'+(i+1)+'</div><div class="cell nm">'+esc(p.n)+'</div><div class="cell num m '+aiCls+'">'+fmtSigned2(p.x)+'</div><div class="cell num m">'+fmtSigned2(p.xz)+'</div><div class="cell num">'+scoreChip(p.y)+'</div><div class="cell num m">'+fmtSigned2(p.yz)+'</div><div class="cell num m '+combCls+'">'+fmtSigned2(p.cz)+'</div></div>';
    }
    return h;
  };
  showAiWcTip = function(ev,p){
    var tip=document.getElementById('aiwcTip'),card=document.getElementById('aiwcCard');
    if(!tip||!card)return;
    tip.innerHTML='<b>'+esc(p.n)+'</b><br><span style="font-family:IBM Plex Mono,monospace;color:var(--t4)">'+p.id+' &middot; SOC '+p.base+'</span><br>AI score: <span class="'+(p.x>0?'p':p.x<0?'n':'z')+'">'+fmtSigned2(p.x)+'</span><br>AI z: '+fmtSigned2(p.xz)+'<br>AI Resilience: '+fmtNum(p.y,2)+'<br>Resilience z: '+fmtSigned2(p.yz)+'<br>Combined z: '+fmtSigned2(p.cz)+'<br>Click to open the occupation drill-down';
    tip.style.display='block';
    var rect=card.getBoundingClientRect(), x=ev.clientX-rect.left+14, y=ev.clientY-rect.top+14;
    x=Math.min(x,rect.width-330); y=Math.min(y,rect.height-140); if(x<10)x=10; if(y<10)y=10;
    tip.style.left=x+'px'; tip.style.top=y+'px';
  };
  renderAiWc = function(){
    var svg=document.getElementById('aiwcSvg'); if(!svg) return;
    var data=buildAiWcData();
    var note=document.getElementById('aiwcNote');
    if(note) note.textContent='Horizontal axis = AI augmentation vs. automation score. Vertical axis = AI Resilience. Hover any point for the occupation, and click a point to open the AI Resilience drill-down.';
    var ben=document.getElementById('aiwcBenefit'),suf=document.getElementById('aiwcSuffer');
    if(ben) ben.innerHTML=makeAiWcList(data.benefit);
    if(suf) suf.innerHTML=makeAiWcList(data.suffer);
    var W=1200,H=620,L=210,R=990,T=34,B=542,PW=R-L,PH=B-T;
    var absRaw=1; for(var i=0;i<data.points.length;i++) absRaw=Math.max(absRaw,Math.abs(data.points[i].x));
    var absX=Math.ceil(absRaw*1.1); if(absX<5)absX=5;
    var xMin=-absX,xMax=absX,yMin=2,yMax=5;
    function xScale(v){return L+(v-xMin)/(xMax-xMin)*PW}
    function yScale(v){return T+(yMax-v)/(yMax-yMin)*PH}
    function clamp(v,min,max){return Math.max(min,Math.min(max,v))}
    function axisLabel(v){var av=Math.abs(v),s=av>=10?String(Math.round(v)):String(Math.round(v*10)/10);return s.replace(/\.0$/,'')}
    function escAttr(s){return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
    function intersects(a,b,pad){pad=pad||0; return !(a.x2+pad<b.x1 || a.x1>b.x2+pad || a.y2+pad<b.y1 || a.y1>b.y2+pad)}
    var x0=xScale(0),yMidVal=3.5,yMid=yScale(yMidVal);
    var h='';
    h+='<rect x="0" y="0" width="'+W+'" height="'+H+'" fill="transparent"/>';
    h+='<rect x="'+L+'" y="'+T+'" width="'+(x0-L)+'" height="'+(yMid-T)+'" fill="rgba(251,191,36,.04)"/>';
    h+='<rect x="'+x0+'" y="'+T+'" width="'+(R-x0)+'" height="'+(yMid-T)+'" fill="rgba(52,211,153,.05)"/>';
    h+='<rect x="'+L+'" y="'+yMid+'" width="'+(x0-L)+'" height="'+(B-yMid)+'" fill="rgba(248,113,113,.05)"/>';
    h+='<rect x="'+x0+'" y="'+yMid+'" width="'+(R-x0)+'" height="'+(B-yMid)+'" fill="rgba(76,154,255,.04)"/>';
    for(var y=2;y<=5;y++){var yy=yScale(y);h+='<text x="'+(L-12)+'" y="'+(yy+4)+'" fill="var(--t4)" font-size="12" text-anchor="end">'+y+'</text>'}
    var xticks=[xMin,xMin/2,0,xMax/2,xMax];
    for(var xt=0;xt<xticks.length;xt++){var xv=xticks[xt],xx=xScale(xv);h+='<text x="'+xx+'" y="'+(B+22)+'" fill="var(--t4)" font-size="12" text-anchor="middle">'+axisLabel(xv)+'</text>'}
    h+='<line x1="'+L+'" y1="'+yMid+'" x2="'+R+'" y2="'+yMid+'" stroke="rgba(255,255,255,.18)" stroke-width="1.4"/>';
    h+='<line x1="'+x0+'" y1="'+T+'" x2="'+x0+'" y2="'+B+'" stroke="rgba(255,255,255,.18)" stroke-width="1.4"/>';
    h+='<rect x="'+L+'" y="'+T+'" width="'+PW+'" height="'+PH+'" fill="none" stroke="rgba(255,255,255,.14)" stroke-width="1"/>';
    h+='<text x="'+(L+16)+'" y="'+(T+18)+'" fill="rgba(251,191,36,.9)" font-size="12" font-weight="700">Automation usage but occupation is resilient to AI</text>';
    h+='<text x="'+(R-16)+'" y="'+(T+18)+'" fill="rgba(52,211,153,.95)" font-size="12" font-weight="700" text-anchor="end">Benefit from AI</text>';
    h+='<text x="'+(L+16)+'" y="'+(B-14)+'" fill="rgba(248,113,113,.95)" font-size="12" font-weight="700">Suffer most from AI</text>';
    h+='<text x="'+(R-16)+'" y="'+(B-14)+'" fill="rgba(76,154,255,.95)" font-size="12" font-weight="700" text-anchor="end">Augmentation usage but AI displacement risk remains</text>';
    h+='<text x="'+((L+R)/2)+'" y="'+(H-18)+'" fill="var(--t3)" font-size="13" text-anchor="middle">AI augmentation vs. automation score</text>';
    h+='<text x="'+(L+6)+'" y="'+(H-36)+'" fill="var(--red)" font-size="12">More automation risk</text>';
    h+='<text x="'+(R-6)+'" y="'+(H-36)+'" fill="var(--grn)" font-size="12" text-anchor="end">More augmentation gain</text>';
    h+='<text transform="translate('+(L-12)+' '+((T+B)/2)+') rotate(-90)" fill="var(--t3)" font-size="13" text-anchor="middle">Work Context AI Resilience Score</text>';
    for(var pi=0;pi<data.points.length;pi++){
      var p=data.points[pi],mark=data.marks[p.id],cx=xScale(p.x),cy=clamp(yScale(p.y),T,B),fill=((p.x<0&&p.y>=yMidVal)||(p.x>0&&p.y<yMidVal))?'#fbbf24':(p.x>0?'#34d399':p.x<0?'#f87171':'#a8b8cc'),op=mark?.95:.33,r=mark?5.6:3.2;
      p.cx=cx; p.cy=cy;
      h+='<circle class="aiwc-pt" data-id="'+escAttr(p.id)+'" cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="'+fill+'" fill-opacity="'+op+'" stroke="'+fill+'" stroke-opacity="'+(mark?.55:.18)+'" stroke-width="'+(mark?1.6:1)+'" style="cursor:pointer" />';
    }
    var taken=[];
    var sideLeft=[], sideRight=[];
    var labels=data.benefit.concat(data.suffer);
    labels.sort(function(a,b){return Math.abs(b.cz)-Math.abs(a.cz) || Math.abs(b.x)-Math.abs(a.x) || (a.n<b.n?-1:1)});
    for(var li=0;li<labels.length;li++){
      var p=labels[li], kind=(data.marks[p.id]&&data.marks[p.id].kind)||'benefit', txt=trimLabel(p.n,26), w=Math.max(54,txt.length*5.7);
      var fill=kind==='benefit'?'rgba(52,211,153,.98)':'rgba(248,113,113,.98)';
      var candidates=[
        {anchor:'start', tx:p.cx+8, ty:p.cy-3, x1:p.cx+6, x2:p.cx+6+w, y1:p.cy-10, y2:p.cy+3},
        {anchor:'end', tx:p.cx-8, ty:p.cy-3, x1:p.cx-8-w, x2:p.cx-8, y1:p.cy-10, y2:p.cy+3},
        {anchor:'middle', tx:p.cx, ty:p.cy-11, x1:p.cx-w/2, x2:p.cx+w/2, y1:p.cy-19, y2:p.cy-6},
        {anchor:'middle', tx:p.cx, ty:p.cy+15, x1:p.cx-w/2, x2:p.cx+w/2, y1:p.cy+4, y2:p.cy+17}
      ];
      var placed=null;
      for(var ci=0;ci<candidates.length;ci++){
        var c=candidates[ci];
        if(c.x1<L+10 || c.x2>R-10 || c.y1<T+8 || c.y2>B-8) continue;
        var overlap=false;
        for(var ti=0;ti<taken.length;ti++) if(intersects(c,taken[ti],6)){ overlap=true; break; }
        if(!overlap){ placed=c; break; }
      }
      if(placed){ placed.text=txt; placed.fill=fill; taken.push(placed); }
      else { (p.x>=0?sideRight:sideLeft).push({p:p,text:txt,fill:fill}); }
    }
    function assignBand(items, side, top, bottom){
      if(!items.length || top>=bottom) return;
      items.sort(function(a,b){ return a.p.cy-b.p.cy; });
      var gap=16,last=top-gap;
      for(var i=0;i<items.length;i++){
        var y=Math.max(top,Math.min(bottom,items[i].p.cy));
        if(y<last+gap) y=last+gap;
        items[i].y=Math.min(y,bottom);
        last=items[i].y;
      }
      for(var j=items.length-2;j>=0;j--){
        if(items[j].y>items[j+1].y-gap) items[j].y=items[j+1].y-gap;
        if(items[j].y<top) items[j].y=top;
      }
      for(var k=0;k<items.length;k++){
        var it=items[k], tx=side==='right'?R+24:L-34;
        var anchor=side==='right'?'start':'end';
        var lx=side==='right'?R+6:L-14;
        h+='<line class="quad-connector" x1="'+it.p.cx+'" y1="'+it.p.cy+'" x2="'+lx+'" y2="'+it.y+'" />';
        h+='<text x="'+tx+'" y="'+(it.y+3.5)+'" fill="'+it.fill+'" font-size="9.5" font-weight="600" text-anchor="'+anchor+'" paint-order="stroke" stroke="rgba(7,9,15,.96)" stroke-width="2.4" stroke-linejoin="round" style="pointer-events:none">'+esc(it.text)+'</text>';
      }
    }
    function assignSide(items, side){
      var top=T+18,bottom=B-8;
      if(side==='left'){
        var centerGap=68;
        var upper=[], lower=[];
        for(var i=0;i<items.length;i++){
          if(items[i].p.cy<=yMid) upper.push(items[i]);
          else lower.push(items[i]);
        }
        assignBand(upper, side, top, yMid-centerGap);
        assignBand(lower, side, yMid+centerGap, bottom);
        return;
      }
      assignBand(items, side, top, bottom);
    }
    for(var ti=0;ti<taken.length;ti++){
      var t=taken[ti];
      h+='<text x="'+t.tx+'" y="'+t.ty+'" fill="'+t.fill+'" font-size="9.5" font-weight="600" text-anchor="'+t.anchor+'" paint-order="stroke" stroke="rgba(7,9,15,.96)" stroke-width="2.4" stroke-linejoin="round" style="pointer-events:none">'+esc(t.text)+'</text>';
    }
    assignSide(sideRight,'right');
    assignSide(sideLeft,'left');
    svg.innerHTML=h;
    var tipPts=svg.querySelectorAll('.aiwc-pt');
    for(var qi=0;qi<tipPts.length;qi++){
      tipPts[qi].addEventListener('mousemove',function(ev){var id=this.getAttribute('data-id'),p=null;for(var si=0;si<data.points.length;si++)if(data.points[si].id===id){p=data.points[si];break}if(p)showAiWcTip(ev,p)});
      tipPts[qi].addEventListener('mouseleave',hideAiWcTip);
      tipPts[qi].addEventListener('click',function(){wcDetail(this.getAttribute('data-id'))});
    }
  };

  refreshWcSummaries();
  if(typeof renderWC==='function') renderWC();
  if(typeof renderAiWc==='function') renderAiWc();
  showView((location.hash||'#tbl').replace('#',''));
})();
/* ---- end v6 clean override ---- */




/* ---- industry tabs patch ---- */
(function(){
  var IDATA=(window.DASHBOARD_DATA&&window.DASHBOARD_DATA.INDUSTRY)||{};
  var IND_OCC=(IDATA.occupationRows)||[];
  var IMETA=IDATA.meta||{};

  var indQry='',indSort='industrialFundamentalScore',indSortDir=-1,indPrimary='';
  var priQry='',priSort='combinedInvestmentScore',priSortDir=-1,priPrimary='';
  var PRI_ROWS=[], PRI_MAP={}, PRI_MEDIAN_RES=0;
  var PRIMARY_LIST=(function(){
    var seen={}, out=[];
    for(var i=0;i<IND_OCC.length;i++){
      var p=String(IND_OCC[i]&&IND_OCC[i].primaryIndustry||'Unspecified').trim()||'Unspecified';
      if(!seen[p]){ seen[p]=1; out.push(p); }
    }
    return out.sort(function(a,b){ return a.toLowerCase()<b.toLowerCase()?-1:a.toLowerCase()>b.toLowerCase()?1:0; });
  })();

  function fmtMoneyCompact(v){
    if(nil(v)) return '—';
    var n=Number(v); if(!isFinite(n)) return esc(String(v));
    var abs=Math.abs(n), suffix='', div=1;
    if(abs>=1e12){suffix='T';div=1e12;}
    else if(abs>=1e9){suffix='B';div=1e9;}
    else if(abs>=1e6){suffix='M';div=1e6;}
    else if(abs>=1e3){suffix='K';div=1e3;}
    return '$'+(n/div).toLocaleString(undefined,{maximumFractionDigits:1,minimumFractionDigits:abs>=1e3?1:0})+suffix;
  }
  function fmtPctSigned(v){ if(nil(v)) return '—'; var n=Number(v); if(!isFinite(n)) return esc(String(v)); return (n>=0?'+':'')+(n*100).toFixed(2)+'%'; }
  function fmtAge(v){ if(nil(v)) return '—'; var n=Number(v); if(!isFinite(n)) return esc(String(v)); return n.toFixed(1); }
  function fmtAgeChange(v){ if(nil(v)) return '—'; var n=Number(v); if(!isFinite(n)) return esc(String(v)); return (n>=0?'+':'')+n.toFixed(1)+' yrs'; }
  function fmtRefYears(v){ return nil(v)?'—':esc(String(v)); }
  function compareMixed(a,b,key,dir){
    var va=a[key], vb=b[key], an=nil(va), bn=nil(vb);
    if(typeof va==='string' || typeof vb==='string'){
      if(an&&bn) return 0; if(an) return 1; if(bn) return -1;
      va=String(va).toLowerCase(); vb=String(vb).toLowerCase();
      return dir*(va<vb?-1:va>vb?1:0);
    }
    if(an&&bn) return 0; if(an) return 1; if(bn) return -1;
    va=Number(va); vb=Number(vb);
    if(va===vb){
      var na=String(a.occupation||a.industry||'').toLowerCase(), nb=String(b.occupation||b.industry||'').toLowerCase();
      return na<nb?-1:na>nb?1:0;
    }
    return dir*(va-vb);
  }
  function localMean(arr){ var s=0; for(var i=0;i<arr.length;i++) s+=arr[i]; return arr.length?s/arr.length:0; }
  function localSd(arr,m){ if(arr.length<2) return 0; var s=0; for(var i=0;i<arr.length;i++){ var d=arr[i]-m; s+=d*d; } return Math.sqrt(s/arr.length); }
  function localMedian(arr){ if(!arr.length) return 0; arr=arr.slice().sort(function(a,b){return a-b}); var mid=Math.floor(arr.length/2); return arr.length%2?arr[mid]:(arr[mid-1]+arr[mid])/2; }
  function avg3(a,b,c){ return (a+b+c)/3; }
  function scoreClsPct(v){ return Number(v)>0?'p':Number(v)<0?'n':'z'; }
  function resilienceCls(v){ return Number(v)>=PRI_MEDIAN_RES?'res-good':'res-bad'; }
  function primaryOptionsHtml(selected){
    var h='<option value="">All primary industries</option>';
    for(var i=0;i<PRIMARY_LIST.length;i++) h+='<option value="'+esc(PRIMARY_LIST[i])+'"'+(PRIMARY_LIST[i]===selected?' selected':'')+'>'+esc(PRIMARY_LIST[i])+'</option>';
    return h;
  }
  function industrialFundamentalForRow(r){
    var v=Number(r&&r.industrialFundamentalScore);
    if(isFinite(v)) return v;
    var keys=['histEmploymentGrowthZ','histWageGrowthZ','projectedEmploymentGrowthZ','medianAge2025Z','medianAgeIncreaseZ'];
    var s=0,n=0;
    for(var i=0;i<keys.length;i++){ var z=Number(r&&r[keys[i]]); if(isFinite(z)){ s+=z; n++; } }
    return n?s/n:0;
  }

  function buildPriorityRows(){
    var base=[];
    for(var i=0;i<IND_OCC.length;i++) if(IND_OCC[i]) base.push(IND_OCC[i]);
    var xs=[], ys=[];
    for(var j=0;j<base.length;j++){
      var occStats=typeof occAdjusted==='function' ? occAdjusted(base[j].id) : null;
      var ai=occStats && isFinite(Number(occStats.s)) ? Number(occStats.s) : Number(base[j].aiScore);
      var res=Number(base[j].aiResilience);
      if(isFinite(ai)) xs.push(ai);
      if(isFinite(res)) ys.push(res);
    }
    var mx=localMean(xs), my=localMean(ys);
    var sdx=localSd(xs,mx), sdy=localSd(ys,my);
    PRI_MEDIAN_RES=localMedian(ys);
    PRI_ROWS=[]; PRI_MAP={};
    for(var k=0;k<base.length;k++){
      var r=base[k];
      var occStats=typeof occAdjusted==='function' ? occAdjusted(r.id) : null;
      var ai2=occStats && isFinite(Number(occStats.s)) ? Number(occStats.s) : Number(r.aiScore);
      var res2=Number(r.aiResilience), fund2=industrialFundamentalForRow(r);
      ai2=isFinite(ai2)?ai2:0; res2=isFinite(res2)?res2:0; fund2=isFinite(fund2)?fund2:0;
      var row={
        id:r.id,
        occupation:r.occupation,
        industry:r.industry,
        primaryIndustry:String(r.primaryIndustry||'Unspecified')||'Unspecified',
        naics:r.naics,
        industrySize:r.industrySize,
        avgSalary:r.avgSalary,
        employment:r.employment,
        histEmploymentGrowth:r.histEmploymentGrowth,
        histWageGrowth:r.histWageGrowth,
        projectedEmploymentGrowth:r.projectedEmploymentGrowth,
        industryGrowthScore:r.industryGrowthScore,
        industrialFundamentalScore:fund2,
        medianAge2019:r.medianAge2019,
        medianAge2022:r.medianAge2022,
        medianAge2025:r.medianAge2025,
        referenceIncreaseInAgeYears:r.referenceIncreaseInAgeYears,
        medianAgeIncrease:r.medianAgeIncrease,
        aiScore:ai2,
        aiResilience:res2,
        aiScoreZ:sdx?(ai2-mx)/sdx:0,
        aiResilienceZ:sdy?(res2-my)/sdy:0,
        service:!!r.service,
        sparse:!!(occStats&&occStats.sparse)
      };
      row.gatedToZero = row.aiScoreZ<0;
      row.combinedInvestmentScore = row.gatedToZero ? 0 : avg3(row.aiScoreZ,row.aiResilienceZ,row.industrialFundamentalScore);
      PRI_ROWS.push(row); PRI_MAP[row.id]=row;
    }
    PRI_ROWS.sort(function(a,b){
      return (b.combinedInvestmentScore-a.combinedInvestmentScore)
        || (b.aiScore-a.aiScore)
        || (b.aiResilience-a.aiResilience)
        || (b.industrialFundamentalScore-a.industrialFundamentalScore)
        || compareMixed(a,b,'occupation',1);
    });
    for(var qi=0;qi<PRI_ROWS.length;qi++) PRI_ROWS[qi].rank=qi+1;
  }

  function ensureButton(nav, viewId, label, beforeNode){
    if(!nav || nav.querySelector('[data-v="'+viewId+'"]')) return;
    var btn=document.createElement('button');
    btn.className='nb'; btn.setAttribute('data-v',viewId); btn.textContent=label;
    nav.insertBefore(btn, beforeNode||null);
  }

  function insertIndustryViews(){
    var nav=document.getElementById('nav');
    if(nav){
      var metBtn=nav.querySelector('[data-v="met"]');
      ensureButton(nav,'take','Key Takeaway for Investors',nav.firstChild);
      ensureButton(nav,'pri','Priority Industries for Investment',metBtn||null);
      ensureButton(nav,'ind','Industry Data',metBtn||null);
      var wcBtn=nav.querySelector('[data-v="wc"]'); if(wcBtn) wcBtn.textContent='AI Resilience';
    }
    var met=document.getElementById('vMet');
    if(met && !document.getElementById('vInd')){
      var ind=document.createElement('div');
      ind.id='vInd'; ind.style.display='none';
      ind.innerHTML=''
        +'<div class="tab-summary"><b>Industry Data:</b> This tab shows the industry fundamentals (mapped by occupation) by growth and labor shortage factor.</div>'
        +'<div class="ctrl"><div class="filter-row ind-filter-row"><div class="sbox"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><input id="indQry" type="text" placeholder="Search occupations, mapped industries, or NAICS codes..."></div><select id="indPrimary"><option>Loading primary industries...</option></select><div class="ls-note ind-data-note ind-filter-note"> — indicates data is not available from BLS data.</div></div></div>'
        +'<div class="sts" id="indCnt"></div>'
        +'<div class="main"><div class="tw ind-table-wrap"><div class="tsc ind-tsc"><table class="industry-table"><thead id="indTh"><tr></tr></thead><tbody id="indTb"></tbody></table></div></div></div>';
      var pri=document.createElement('div');
      pri.id='vPri'; pri.style.display='none';
      pri.innerHTML=''
        +'<div class="tab-summary"><b>Priority Industries for Investment:</b> This tab ranks sub-verticals by investment attractiveness in the age of AI, combining three lens (1) How much does AI augments the industry; (2) How resilient is the industry to technology shock / how critical human element is to the service delivery; (3) Industry fundamentals in terms of growth and labor shortage. More details for each element can be found in other tabs </div>'
        +'<div class="ctrl"><div class="filter-row"><div class="sbox"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><input id="priQry" type="text" placeholder="Search occupations, mapped industries, or NAICS codes..."></div><select id="priPrimary"><option>Loading primary industries...</option></select></div></div>'
        +'<div class="sts" id="priCnt"></div>'
        +'<div class="main"><div class="tw"><div class="tsc"><table><thead id="priTh"></thead><tbody id="priTb"></tbody></table></div></div></div>';
      met.parentNode.insertBefore(pri, met);
      met.parentNode.insertBefore(ind, met);
    }
    var indPrimaryEl=document.getElementById('indPrimary'); if(indPrimaryEl) indPrimaryEl.innerHTML=primaryOptionsHtml(indPrimary);
    var priPrimaryEl=document.getElementById('priPrimary'); if(priPrimaryEl) priPrimaryEl.innerHTML=primaryOptionsHtml(priPrimary);
  }

  function patchMethodology(){
    var intro=document.querySelector('#vMet .mth-intro p');
    if(intro){
      intro.textContent='This dashboard combines occupation-level AI task usage patterns, O*NET task and work-context measures, and industry mapping, growth, and age data to show where AI appears more likely to augment work, where displacement risk remains, and which occupation-led service verticals look most investable.';
    }
    var toc=document.querySelector('.mth-toc');
    if(toc){
      toc.innerHTML=''
        +'<a class="mth-toc-item" href="#met-priority-industries"><strong>Priority Industries for Investment</strong><span>Explains the combined investment scorecard used to rank the most attractive occupation-led sub-verticals.</span></a>'
        +'<a class="mth-toc-item" href="#met-ai-vs-work-context"><strong>AI vs. Work Context</strong><span>Plots the occupation AI score against the Work Context AI Resilience score and highlights the strongest combined upside and downside occupations.</span></a>'
        +'<a class="mth-toc-item" href="#met-ai-score"><strong>AI Augmentation vs. Automation</strong><span>Shows the occupation AI score using task-level AI interaction patterns, task importance, task frequency weights, and the human / physical task filter.</span></a>'
        +'<a class="mth-toc-item" href="#met-work-context"><strong>AI Resilience</strong><span>Shows the four O*NET work-context measures used to construct the AI Resilience score.</span></a>'
        +'<a class="mth-toc-item" href="#met-industry-data"><strong>Industry Data</strong><span>Explains how occupations are mapped into investable sub-verticals and how size, growth, and age factors are constructed.</span></a>'
        +'<a class="mth-toc-item" href="#met-data-sources"><strong>Data Sources</strong><span>Lists the source datasets used to build the current dashboard.</span></a>';
    }
    var aiScore=document.getElementById('met-ai-score');
    if(aiScore){
      var ps=aiScore.querySelectorAll('p');
      if(ps[0]) ps[0].textContent='This tab estimates whether currently observed AI usage patterns for an occupation lean more toward augmenting work or automating work.';
      if(ps[3]) ps[3].textContent='Tasks that still require embodied, in-person, hands-on, equipment-based, or live-service execution are treated as human / physical tasks. Those tasks remain visible in the drill-down, but their displayed AI score is forced to 0 so the occupation score focuses on tasks that current AI use can more plausibly reshape.';
      if(ps[4]) ps[4].textContent='The current implementation uses a model-based classifier (Haiku 4.5) that reads each O*NET task statement against an operational rubric. A task is treated as human / physical if completing it end-to-end requires manipulating physical objects, materials, tools, machinery, or vehicles; touching, examining, or moving a person or animal; being bodily present at a specific work location; or live face-to-face presence where the embodied interaction is part of the work. Tasks that can plausibly be accomplished through writing, reading, analysis, software operation, or remote communication (phone, video, chat, email) are not treated as human / physical, even when the verbs sound hands-on (for example, "operate" software, "prepare" reports, or "interview" by telephone).';
      if(ps[5]) ps[5].textContent='The occupation score is the frequency-weighted sum of score-eligible AI tasks, using each task\'s O*NET frequency weight share in the occupation.';
      if(ps[6]) ps[6].textContent='A task contributes to the occupation score only if it is AI-exposed, not human / physical, has classified AI interaction data, and has a non-zero displayed task score.';
    }
    var workContext=document.getElementById('met-work-context');
    if(workContext){
      var p=workContext.querySelector('p');
      if(p) p.textContent="This tab shows the four O*NET work-context measures used in the dashboard's resilience lens.";
      var fm=workContext.querySelector('.fm');
      if(fm) fm.innerHTML='AI_resilience = Average(Contact With Others,<br>Consequence of Error,<br>Impact of Decisions on Co-workers or Company Results,<br>Importance of Being Exact or Accurate)';
    }
    var dataSection=document.getElementById('met-data-sources');
    if(dataSection){
      var grid=dataSection.querySelector('.src-grid');
      if(grid){
        grid.innerHTML=''
          +'<div class="src-item"><div class="src-label">Anthropic Economic Index</div><div class="src-desc">Anthropic Economic Index usage data classified by O*NET task and interaction type.<br><a href="https://huggingface.co/datasets/Anthropic/EconomicIndex/tree/main/release_2026_03_24" target="_blank" rel="noopener">huggingface.co/datasets/Anthropic/EconomicIndex</a></div></div>'
          +'<div class="src-item"><div class="src-label">O*NET Task Ratings</div><div class="src-desc">U.S. Department of Labor occupational database with task statements and ratings for importance, relevance, and frequency. The dashboard uses importance in task scoring and task frequency weight shares at the occupation level.<br><a href="https://www.onetcenter.org/dictionary/20.1/excel/task_ratings.html" target="_blank" rel="noopener">onetcenter.org/dictionary/20.1/excel/task_ratings.html</a></div></div>'
          +'<div class="src-item"><div class="src-label">O*NET Work Context</div><div class="src-desc">Work-context measures used here for contact with others, consequence of error, impact of decisions, and exactness / accuracy.<br><a href="https://www.onetcenter.org/dictionary/30.2/excel/work_context.html" target="_blank" rel="noopener">onetcenter.org/dictionary/30.2/excel/work_context.html</a></div></div>'
          +'<div class="src-item"><div class="src-label">Industry Data</div><div class="src-desc">Industry employment and wage reference tables used to support the industry mapping and growth fields shown in the dashboard.<br><a href="https://www.bls.gov/oes/tables.htm" target="_blank" rel="noopener">bls.gov/oes/tables.htm</a></div></div>'
          +'<div class="src-item"><div class="src-label">Age by Occupation Data</div><div class="src-desc">User-provided occupation-level median age data for 2019, 2022, and 2025, including the reference-year range and change in median age.</div></div>';
      }
      var p2=dataSection.querySelector('p');
      if(p2) p2.textContent='All scores in this dashboard reflect observed current usage patterns, structural job characteristics, and industry / age reference data in the loaded datasets, not a forecast of ultimate AI capability or guaranteed job outcomes.';
    }
    if(dataSection && !document.getElementById('met-industry-data')){
      var s1=document.createElement('section');
      s1.id='met-industry-data'; s1.className='mth-section';
      s1.innerHTML=''
        +'<h2>Industry Data</h2>'
        +'<p>Each occupation is mapped to a most relevant industry using the workbook&#39;s <code>Specific NAICS Index Match</code> field, along with a higher-level primary industry grouping used for filtering.</p>'
        +'<p>Estimated industry size is approximated with occupation-level wage pool data, using the latest average annual wage multiplied by the latest employment count available for the mapped occupation.</p>'
        +'<div class="fm">estimated_industry_size ≈ latest_average_salary × latest_employment</div>'
        +'<p>The Industrial Fundamental Score summarizes recent wage growth, recent employment growth, projected employment growth, 2025 median age, and change in median age into one standardized view of industry fundamentals and labor shortage signals.</p>'
        +'<div class="fm">industrial_fundamental_score = Average(z(historical_employment_growth), z(historical_wage_growth), z(projected_employment_growth), z(2025_median_age), z(increase_in_median_age))</div>'
        +'<a class="mth-jump" href="#met-contents">Back to contents</a>';
      var s2=document.createElement('section');
      s2.id='met-priority-industries'; s2.className='mth-section';
      s2.innerHTML=''
        +'<h2>Priority Industries for Investment</h2>'
        +'<p>This scorecard treats each occupation-led sub-vertical as its own investment row, then combines AI augmentation, AI resilience, and the Industrial Fundamental Score into a single standardized ranking.</p>'
        +'<div class="fm">combined_investment_score = Average(z(ai_augmentation_score), z(ai_resilience_score), industrial_fundamental_score)</div>'
        +'<p>If an occupation&#39;s AI augmentation z-score is negative, the combined investment score is forced to 0 so the screen remains focused on AI-enabled services rather than AI-exposed headwinds.</p>'
        +'<div class="fm">if z(ai_augmentation_score) &lt; 0, combined_investment_score = 0</div>'
        +'<a class="mth-jump" href="#met-contents">Back to contents</a>';
      dataSection.parentNode.insertBefore(s1, dataSection);
      dataSection.parentNode.insertBefore(s2, dataSection);
    }
    var wrap=document.querySelector('#vMet .mth');
    if(wrap){
      var order=['met-priority-industries','met-ai-vs-work-context','met-ai-score','met-work-context','met-industry-data','met-data-sources'];
      for(var i=0;i<order.length;i++){
        var node=document.getElementById(order[i]);
        if(node) wrap.appendChild(node);
      }
    }
  }

  var indCols=[
    {k:'occupation',l:'Occupation',t:'O*NET occupation title.',s:'width:18%'},
    {k:'industry',l:'Most Relevant Industry',t:'Mapped from the uploaded workbook\'s Specific NAICS Index Match column.',s:'width:17%'},
    {k:'primaryIndustry',l:'Primary Industry',t:'Higher-level industry grouping used for filtering.',s:'width:10%'},
    {k:'industrySize',l:'Est. Industry Size',t:'Estimated industry size approximated by the combined wage pool of the occupation level.',s:'width:8%'},
    {k:'industrialFundamentalScore',l:'Industrial Fundamental Score',t:'Average of standardized z-scores for historical employment growth, historical wage growth, projected employment growth, 2025 median age, and increase in median age.', main:true,s:'width:9%'},
    {k:'histEmploymentGrowth',l:'Historical Employment Growth',t:'2019–2024 OEWS employment CAGR.',s:'width:8%'},
    {k:'histWageGrowth',l:'Historical Wage Growth',t:'2019–2024 OEWS wage CAGR.',s:'width:7%'},
    {k:'projectedEmploymentGrowth',l:'Projected Employment Growth',t:'2024–2034 BLS projected employment CAGR.',s:'width:8%'},
    {k:'medianAge2025',l:'2025 Median Age',t:'2025 median age by occupation from the age source data.',s:'width:7%'},
    {k:'medianAgeIncrease',l:'Increase in Median Age',t:'Change in median age by occupation over the available reference-year range.',s:'width:8%'}
  ];

  function renderGenericHeader(targetId, cols, sortKey, sortDir, fnName){
    var tr=document.getElementById(targetId); if(!tr) return;
    var h='';
    for(var i=0;i<cols.length;i++){
      var c=cols[i], isSorted=c.k===sortKey;
      var arrow=isSorted?(sortDir===1?' &#9650;':' &#9660;'):' &#8597;';
      h+='<th'+(c.s?' style="'+c.s+'"':'')+' class="'+(isSorted?'sorted ':'')+(c.main?'primary-col-head':'')+'" onclick="'+fnName+'(\''+c.k+'\')">';
      h+=tipDown(c.l+'<span class="sa">'+arrow+'</span>',c.t);
      h+='</th>';
    }
    tr.querySelector('tr').innerHTML=h;
  }

  function industryById(id){ for(var i=0;i<IND_OCC.length;i++) if(IND_OCC[i].id===id) return IND_OCC[i]; return null; }

  function buildIndustryDetail(id){
    var r=industryById(id); if(!r) return '';
    var occStats=typeof occAdjusted==='function' ? occAdjusted(id) : null;
    var resRaw=Number(r.aiResilience)||0;
    var h='<button class="x" id="xb">&times;</button>';
    h+='<div class="dt">'+esc(r.occupation)+'</div>';
    h+='<div class="dc">'+esc(r.id)+' &middot; Industry Data drill-down</div>';
    h+=(window.buildSocDescBox?window.buildSocDescBox(id,'Occupation description'):'');
    h+='<div class="sct" style="margin-top:12px">Score Components</div>';
    h+='<div class="scs">These are the occupation-level signals that feed into the industry attractiveness view for this mapped sub-vertical.</div>';
    h+='<div class="sc-row">';
    h+='<div class="sc-box"><div class="lb">AI Augmentation Score</div><div class="vl '+cls(occStats?occStats.s:r.aiScore)+'">'+fmtScore(occStats?occStats.s:r.aiScore)+'</div><div class="mt">Occupation-level AI augmentation vs. automation signal</div></div>';
    h+='<div class="sc-box"><div class="lb">AI Resilience Score</div><div class="vl '+resilienceCls(resRaw)+'">'+fmtNum(resRaw,2)+'</div><div class="mt">Above-median resilience scores are shown in green</div></div>';
    h+='<div class="sc-box"><div class="lb">Industrial Fundamental Score</div><div class="vl '+scoreClsPct(r.industrialFundamentalScore)+'">'+fmtSigned2(r.industrialFundamentalScore)+'</div><div class="mt">Average of standardized growth and age / labor shortage factors</div></div>';
    h+='</div>';
    h+='<div class="sct" style="margin-top:12px">Industry Size / Wage Pool Detail</div>';
    h+='<div class="scs">Estimated industry size approximated by the combined wage pool of the occupation level.</div>';
    h+='<div class="sc-row">';
    h+='<div class="sc-box detail-em"><div class="lb">Est. Industry Size</div><div class="vl">'+fmtMoneyCompact(r.industrySize)+'</div><div class="mt">Average salary × employment</div></div>';
    h+='<div class="sc-box"><div class="lb">Average Salary</div><div class="vl">'+fmtMoneyCompact(r.avgSalary)+'</div><div class="mt">Latest available annual wage</div></div>';
    h+='<div class="sc-box"><div class="lb">Employment</div><div class="vl">'+fmtInt(r.employment)+'</div><div class="mt">Latest available OEWS employment</div></div>';
    h+='<div class="sc-box"><div class="lb">Primary Industry</div><div class="vl" style="font-size:1rem;line-height:1.35">'+esc(r.primaryIndustry||'Unspecified')+'</div><div class="mt">Higher-level filter grouping</div></div>';
    h+='</div>';
    h+='<div class="sct" style="margin-top:12px">Mapped Industry</div>';
    h+='<div class="sc-row">';
    h+='<div class="sc-box"><div class="lb">Most Relevant Industry</div><div class="vl" style="font-size:1rem;line-height:1.35">'+esc(r.industry||'—')+'</div><div class="mt">NAICS '+esc(r.naics||'—')+'</div></div>';
    h+='<div class="sc-box"><div class="lb">Historical Employment Growth</div><div class="vl '+scoreClsPct(r.histEmploymentGrowth)+'">'+fmtPctSigned(r.histEmploymentGrowth)+'</div><div class="mt">2019–2024 OEWS employment CAGR</div></div>';
    h+='<div class="sc-box"><div class="lb">Historical Wage Growth</div><div class="vl '+scoreClsPct(r.histWageGrowth)+'">'+fmtPctSigned(r.histWageGrowth)+'</div><div class="mt">2019–2024 OEWS wage CAGR</div></div>';
    h+='<div class="sc-box"><div class="lb">Projected Employment Growth</div><div class="vl '+scoreClsPct(r.projectedEmploymentGrowth)+'">'+fmtPctSigned(r.projectedEmploymentGrowth)+'</div><div class="mt">2024–2034 BLS projection CAGR</div></div>';
    h+='</div>';
    h+='<div class="sct" style="margin-top:12px">Age by Occupation</div>';
    h+='<div class="scs">Median age data is occupation-level and is used as part of the Industrial Fundamental Score.</div>';
    h+='<div class="sc-row">';
    h+='<div class="sc-box"><div class="lb">2019 Median Age</div><div class="vl">'+fmtAge(r.medianAge2019)+'</div></div>';
    h+='<div class="sc-box"><div class="lb">2022 Median Age</div><div class="vl">'+fmtAge(r.medianAge2022)+'</div></div>';
    h+='<div class="sc-box detail-em"><div class="lb">2025 Median Age</div><div class="vl">'+fmtAge(r.medianAge2025)+'</div></div>';
    h+='<div class="sc-box"><div class="lb">Increase in Median Age</div><div class="vl '+scoreClsPct(r.medianAgeIncrease)+'">'+fmtAgeChange(r.medianAgeIncrease)+'</div><div class="mt">Reference: '+fmtRefYears(r.referenceIncreaseInAgeYears)+'</div></div>';
    h+='</div>';
    h+='<div class="contact-note pnl-contact-note"><strong>Questions?</strong> Please direct any questions to Wilson Zhang at <a href="mailto:wilson.z1015@gmail.com" style="color:var(--blue);text-decoration:none">wilson.z1015@gmail.com</a> / <a href="https://www.linkedin.com/in/wilsonzhang10/" target="_blank" rel="noopener" style="color:var(--blue);text-decoration:none">https://www.linkedin.com/in/wilsonzhang10/</a>.</div>';
    return h;
  }

  function indDetail(id){
    var pnl=document.getElementById('pnl'); if(!pnl) return;
    pnl.innerHTML=buildIndustryDetail(id);
    document.getElementById('ov').classList.add('open');
    document.body.style.overflow='hidden';
    var xb=document.getElementById('xb'); if(xb) xb.onclick=cld;
  }
  window.indDetail=indDetail;

  function renderIndustryData(){
    var tb=document.getElementById('indTb'); if(!tb) return;
    renderGenericHeader('indTh', indCols, indSort, indSortDir, 'indsort');
    var list=IND_OCC.slice();
    if(indPrimary) list=list.filter(function(r){ return String(r.primaryIndustry||'Unspecified')===indPrimary; });
    if(indQry){
      var q=indQry.toLowerCase();
      list=list.filter(function(r){
        return String(r.occupation||'').toLowerCase().indexOf(q)>=0
          || String(r.industry||'').toLowerCase().indexOf(q)>=0
          || String(r.primaryIndustry||'').toLowerCase().indexOf(q)>=0
          || String(r.id||'').toLowerCase().indexOf(q)>=0
          || String(r.naics||'').toLowerCase().indexOf(q)>=0;
      });
    }
    list.sort(function(a,b){ return compareMixed(a,b,indSort,indSortDir); });
    var cnt=document.getElementById('indCnt');
    if(cnt) cnt.innerHTML='<div class="st"><b>'+list.length.toLocaleString()+'</b><span>occupation rows</span></div><div class="st"><span>Filter:</span> <b>'+(indPrimary?esc(indPrimary):'All primary industries')+'</b></div>';
    var h='';
    for(var i=0;i<list.length;i++){
      var r=list[i];
      h+='<tr data-id="'+esc(r.id)+'" title="Click for drill-down" class="clickable-row">'
        +'<td><div class="tn">'+esc(r.occupation)+'</div><div class="subcd">'+esc(r.id)+'</div></td>'
        +'<td><div>'+esc(r.industry)+'</div><div class="subcd">NAICS '+esc(r.naics||'—')+'</div></td>'
        +'<td>'+esc(r.primaryIndustry||'Unspecified')+'</td>'
        +'<td class="m">'+fmtMoneyCompact(r.industrySize)+'</td>'
        +'<td class="m primary-col-cell '+scoreClsPct(r.industrialFundamentalScore)+'">'+fmtSigned2(r.industrialFundamentalScore)+'</td>'
        +'<td class="m '+scoreClsPct(r.histEmploymentGrowth)+'">'+fmtPctSigned(r.histEmploymentGrowth)+'</td>'
        +'<td class="m '+scoreClsPct(r.histWageGrowth)+'">'+fmtPctSigned(r.histWageGrowth)+'</td>'
        +'<td class="m '+scoreClsPct(r.projectedEmploymentGrowth)+'">'+fmtPctSigned(r.projectedEmploymentGrowth)+'</td>'
        +'<td class="m">'+fmtAge(r.medianAge2025)+'</td>'
        +'<td class="m '+scoreClsPct(r.medianAgeIncrease)+'">'+fmtAgeChange(r.medianAgeIncrease)+'</td>'
        +'</tr>';
    }
    tb.innerHTML=h;
  }

  function renderPriorityHeader(){
    var thead=document.getElementById('priTh'); if(!thead) return;
    function cell(label,key,tip,extra,rowspan){
      var isSorted=key===priSort, arrow=isSorted?(priSortDir===1?' &#9650;':' &#9660;'):' &#8597;';
      return '<th'+(rowspan?' rowspan="'+rowspan+'"':'')+(extra?' class="'+extra+(isSorted?' sorted':'')+'"':' class="'+(isSorted?'sorted':'')+'"')+(key?' onclick="prisort(\''+key+'\')"':'')+'>'+(key?tipDown(label+'<span class="sa">'+arrow+'</span>',tip):label)+'</th>';
    }
    var h='';
    h+='<tr class="priority-head-top">';
    h+=cell('#','rank','Rank by combined Z-score.','',1);
    h+=cell('Occupation','occupation','O*NET occupation title used as the row-level investment unit.', '', 1);
    h+=cell('Most Relevant Industry','industry','Mapped industry from the workbook\'s Specific NAICS Index Match column.','',1);
    h+=cell('Primary Industry','primaryIndustry','Higher-level industry grouping used for filtering.','',1);
    h+=cell('Est. Industry Size','industrySize','Estimated industry size approximated by the combined wage pool of the occupation level.','',1);
    h+=cell('AI Augmentation Z-Score','aiScoreZ','Standardized Z-score for AI\'s impact for each occupation, positive = augmentation-oriented, negative = automation-oriented','group',1);
    h+=cell('AI Resilience Z-Score','aiResilienceZ','Standardized Z-score for how critical human interaction and judgement is to the job, positive = more resilient than average, negative = less resilient than average','group',1);
    h+=cell('Industrial Fundamental Score','industrialFundamentalScore','Standardized Z-score for industry fundamentals (industry growth and labor shortage), positive = above average industry fundamentals, negative = below average industry fundamentals','group',1);
    h+=cell('Combined Z-Score','combinedInvestmentScore','Equal-weight average of AI Augmentation Z-Score, AI Resilience Z-Score, and Industrial Fundamental Score, forced to 0 only when the AI augmentation z-score is negative.','master',1);
    h+='</tr>';
    thead.innerHTML=h;
  }

  function buildPriorityDetail(id){
    var r=PRI_MAP[id]; if(!r) return '';
    var occStats=typeof occAdjusted==='function' ? occAdjusted(id) : null;
    var w=(typeof WCM!=='undefined' && (WCM[id]||WCM[baseSoc(id)])) || null;
    var h='<button class="x" id="xb">&times;</button>';
    h+='<div class="dt">'+esc(r.occupation)+'</div>';
    h+='<div class="dc">'+esc(r.id)+' &middot; Priority Industries for Investment drill-down</div>';
    h+=(window.buildSocDescBox?window.buildSocDescBox(id,'Occupation description'):'');
    h+='<div class="sct" style="margin-top:12px">Score Breakdown</div>';
    h+='<div class="scs">These cards show the raw values and standardized scores that roll into the combined investment score, with the Combined Z-Score serving as the master ranking lens.</div>';
    h+='<div class="sc-row">';
    h+='<div class="sc-box"><div class="lb">AI Augmentation Score</div><div class="vl '+cls(r.aiScore)+'">'+fmtScore(r.aiScore)+'</div><div class="mt">Z-score: '+fmtSigned2(r.aiScoreZ)+(r.sparse?' · zeroed for limited AI coverage':'')+'</div></div>';
    h+='<div class="sc-box"><div class="lb">AI Resilience Score</div><div class="vl '+resilienceCls(r.aiResilience)+'">'+fmtNum(r.aiResilience,2)+'</div><div class="mt">Z-score: '+fmtSigned2(r.aiResilienceZ)+'</div></div>';
    h+='<div class="sc-box"><div class="lb">Industrial Fundamental Score</div><div class="vl '+scoreClsPct(r.industrialFundamentalScore)+'">'+fmtSigned2(r.industrialFundamentalScore)+'</div><div class="mt">Industry growth + labor shortage factors</div></div>';
    h+='<div class="sc-box detail-em"><div class="lb">Combined Z-Score</div><div class="vl '+cls(r.combinedInvestmentScore)+'">'+fmtSigned2(r.combinedInvestmentScore)+'</div><div class="mt">Rank #'+fmtInt(r.rank)+(r.gatedToZero?' · forced to 0 because AI augmentation z-score is negative':'')+'</div></div>';
    h+='</div>';
    if(occStats){
      h+='<div class="sct" style="margin-top:12px">AI Augmentation Score Detail</div>';
      h+='<div class="scs">This section explains the high-level task mix behind the AI Augmentation Score, including how much of the occupation is covered by AI-exposed tasks and whether those tasks skew toward augmentation or automation.</div>';
      h+='<div class="sc-row">';
      h+='<div class="sc-box"><div class="lb">AI Score (Chat)</div><div class="vl '+cls(occStats.s)+'">'+f2(occStats.s)+'</div><div class="mt"><span class="bg '+occStats.ct+'" style="font-size:.6rem;padding:1px 7px">'+CL[occStats.ct]+'</span></div></div>';
      h+='<div class="sc-box"><div class="lb">AI Coverage</div><div class="vl" style="font-size:1.4rem">'+occStats.ai+' <span style="font-size:.9rem;color:var(--t3)">tasks</span></div><div class="mt">'+pct(occStats.cv)+' coverage</div></div>';
      h+='<div class="sc-box"><div class="lb">Automation Share</div><div class="vl n">'+pct(occStats.au)+'</div><div class="mt">Directive + Feedback Loop</div></div>';
      h+='<div class="sc-box"><div class="lb">Augmentation Share</div><div class="vl p">'+pct(occStats.ag)+'</div><div class="mt">Task Iteration + Validation + Learning</div></div>';
      h+='</div>';
    }
    if(w){
      h+='<div class="sct" style="margin-top:12px">AI Resilience Context</div>';
      h+='<div class="sc-row">';
      h+='<div class="sc-box"><div class="lb">Contact With Others</div><div class="vl" style="font-size:1rem">'+wcMetricChip(wcMetric(w,'contact'))+'</div></div>';
      h+='<div class="sc-box"><div class="lb">Consequence of Error</div><div class="vl" style="font-size:1rem">'+wcMetricChip(wcMetric(w,'error'))+'</div></div>';
      h+='<div class="sc-box"><div class="lb">Impact of Decisions</div><div class="vl" style="font-size:1rem">'+wcMetricChip(wcMetric(w,'impact'))+'</div></div>';
      h+='<div class="sc-box"><div class="lb">Exact or Accurate</div><div class="vl" style="font-size:1rem">'+wcMetricChip(wcMetric(w,'exact'))+'</div></div>';
      h+='</div>';
    }
    h+='<div class="sct" style="margin-top:12px">Industrial Fundamental Score Detail</div>';
    h+='<div class="scs">The Industrial Fundamental Score averages standardized z-scores for the five industry growth and labor shortage factors below.</div>';
    h+='<div class="sc-row">';
    h+='<div class="sc-box"><div class="lb">Historical Employment Growth</div><div class="vl '+scoreClsPct(r.histEmploymentGrowth)+'">'+fmtPctSigned(r.histEmploymentGrowth)+'</div><div class="mt">2019–2024 OEWS employment CAGR</div></div>';
    h+='<div class="sc-box"><div class="lb">Historical Wage Growth</div><div class="vl '+scoreClsPct(r.histWageGrowth)+'">'+fmtPctSigned(r.histWageGrowth)+'</div><div class="mt">2019–2024 OEWS wage CAGR</div></div>';
    h+='<div class="sc-box"><div class="lb">Projected Employment Growth</div><div class="vl '+scoreClsPct(r.projectedEmploymentGrowth)+'">'+fmtPctSigned(r.projectedEmploymentGrowth)+'</div><div class="mt">2024–2034 BLS projection CAGR</div></div>';
    h+='<div class="sc-box"><div class="lb">2025 Median Age</div><div class="vl">'+fmtAge(r.medianAge2025)+'</div><div class="mt">Occupation-level median age</div></div>';
    h+='<div class="sc-box"><div class="lb">Increase in Median Age</div><div class="vl '+scoreClsPct(r.medianAgeIncrease)+'">'+fmtAgeChange(r.medianAgeIncrease)+'</div><div class="mt">Reference: '+fmtRefYears(r.referenceIncreaseInAgeYears)+'</div></div>';
    h+='</div>';
    h+='<div class="sct" style="margin-top:12px">Mapped Industry and Est. Industry Size</div>';
    h+='<div class="scs">This view treats the occupation as its own mapped industry row for now, using the workbook\'s Specific NAICS Index Match field.</div>';
    h+='<div class="sc-row">';
    h+='<div class="sc-box"><div class="lb">Most Relevant Industry</div><div class="vl" style="font-size:1rem;line-height:1.35">'+esc(r.industry||'—')+'</div><div class="mt">NAICS '+esc(r.naics||'—')+'</div></div>';
    h+='<div class="sc-box"><div class="lb">Primary Industry</div><div class="vl" style="font-size:1rem;line-height:1.35">'+esc(r.primaryIndustry||'Unspecified')+'</div><div class="mt">Higher-level filter grouping</div></div>';
    h+='<div class="sc-box detail-em"><div class="lb">Est. Industry Size</div><div class="vl">'+fmtMoneyCompact(r.industrySize)+'</div><div class="mt">Average salary × employment</div></div>';
    h+='<div class="sc-box"><div class="lb">Average Salary</div><div class="vl">'+fmtMoneyCompact(r.avgSalary)+'</div><div class="mt">Latest available annual wage</div></div>';
    h+='<div class="sc-box"><div class="lb">Employment</div><div class="vl">'+fmtInt(r.employment)+'</div><div class="mt">Latest available OEWS employment</div></div>';
    h+='</div>';
    h+='<div class="contact-note pnl-contact-note"><strong>Questions?</strong> Please direct any questions to Wilson Zhang at <a href="mailto:wilson.z1015@gmail.com" style="color:var(--blue);text-decoration:none">wilson.z1015@gmail.com</a> / <a href="https://www.linkedin.com/in/wilsonzhang10/" target="_blank" rel="noopener" style="color:var(--blue);text-decoration:none">https://www.linkedin.com/in/wilsonzhang10/</a>.</div>';
    return h;
  }

  function priDetail(id){
    var pnl=document.getElementById('pnl'); if(!pnl) return;
    pnl.innerHTML=buildPriorityDetail(id);
    document.getElementById('ov').classList.add('open');
    document.body.style.overflow='hidden';
    var xb=document.getElementById('xb'); if(xb) xb.onclick=cld;
  }
  window.priDetail=priDetail;

  function renderPriorityIndustries(){
    var tb=document.getElementById('priTb'); if(!tb) return;
    renderPriorityHeader();
    var list=PRI_ROWS.slice();
    if(priPrimary) list=list.filter(function(r){ return String(r.primaryIndustry||'Unspecified')===priPrimary; });
    if(priQry){
      var q=priQry.toLowerCase();
      list=list.filter(function(r){
        return String(r.occupation||'').toLowerCase().indexOf(q)>=0
          || String(r.industry||'').toLowerCase().indexOf(q)>=0
          || String(r.primaryIndustry||'').toLowerCase().indexOf(q)>=0
          || String(r.naics||'').toLowerCase().indexOf(q)>=0
          || String(r.id||'').toLowerCase().indexOf(q)>=0;
      });
    }
    list.sort(function(a,b){ return compareMixed(a,b,priSort,priSortDir); });
    var cnt=document.getElementById('priCnt');
    if(cnt) cnt.innerHTML='<div class="st"><b>'+list.length.toLocaleString()+'</b><span>occupation rows</span></div><div class="st"><span>Filter:</span> <b>'+(priPrimary?esc(priPrimary):'All primary industries')+'</b></div><div class="st"><span>Screen:</span> <b>AI augmentation z-score floor</b></div>';
    var h='';
    for(var i=0;i<list.length;i++){
      var r=list[i];
      h+='<tr class="priority-row clickable-row" data-id="'+esc(r.id)+'" title="Click for score breakdown">'
        +'<td class="m">'+fmtInt(r.rank)+'</td>'
        +'<td><div class="tn">'+esc(r.occupation)+'</div><div class="subcd">'+esc(r.id)+'</div></td>'
        +'<td><div>'+esc(r.industry)+'</div><div class="subcd">NAICS '+esc(r.naics||'—')+'</div></td>'
        +'<td>'+esc(r.primaryIndustry||'Unspecified')+'</td>'
        +'<td class="m">'+fmtMoneyCompact(r.industrySize)+'</td>'
        +'<td class="m '+cls(r.aiScoreZ)+'">'+fmtSigned2(r.aiScoreZ)+'</td>'
        +'<td class="m '+cls(r.aiResilienceZ)+'">'+fmtSigned2(r.aiResilienceZ)+'</td>'
        +'<td class="m '+cls(r.industrialFundamentalScore)+'">'+fmtSigned2(r.industrialFundamentalScore)+'</td>'
        +'<td class="m master-col '+cls(r.combinedInvestmentScore)+'"><b>'+fmtSigned2(r.combinedInvestmentScore)+'</b>'+(r.gatedToZero?'<div class="subcd">AI floor</div>':'')+'</td>'
        +'</tr>';
    }
    tb.innerHTML=h;
  }

  window.indsort=function(col){ if(indSort===col){indSortDir*=-1}else{indSort=col; indSortDir=(col==='occupation'||col==='industry'||col==='primaryIndustry')?1:-1;} renderIndustryData(); };
  window.prisort=function(col){ if(priSort===col){priSortDir*=-1}else{priSort=col; priSortDir=(col==='occupation'||col==='industry'||col==='primaryIndustry')?1:-1;} renderPriorityIndustries(); };

  buildPriorityRows();
  insertIndustryViews();
  patchMethodology();

  var indQryEl=document.getElementById('indQry'); if(indQryEl) indQryEl.oninput=function(e){ indQry=e.target.value; renderIndustryData(); };
  var priQryEl=document.getElementById('priQry'); if(priQryEl) priQryEl.oninput=function(e){ priQry=e.target.value; renderPriorityIndustries(); };
  var indPrimaryEl=document.getElementById('indPrimary'); if(indPrimaryEl) indPrimaryEl.onchange=function(e){ indPrimary=e.target.value; renderIndustryData(); };
  var priPrimaryEl=document.getElementById('priPrimary'); if(priPrimaryEl) priPrimaryEl.onchange=function(e){ priPrimary=e.target.value; renderPriorityIndustries(); };
  var indTbEl=document.getElementById('indTb'); if(indTbEl) indTbEl.onclick=function(e){ var tr=e.target.closest('tr'); if(tr){ var id=tr.getAttribute('data-id'); if(id) indDetail(id); } };
  var priTbEl=document.getElementById('priTb'); if(priTbEl) priTbEl.onclick=function(e){ var tr=e.target.closest('tr'); if(tr){ var id=tr.getAttribute('data-id'); if(id) priDetail(id); } };

  showView=function(v){
    if(['take','pri','aiwc','tbl','wc','ind','met'].indexOf(v)<0) v='take';
    var bs=document.querySelectorAll('.nb');
    for(var i=0;i<bs.length;i++) bs[i].classList.toggle('on',bs[i].getAttribute('data-v')===v);
    var map={vTake:'take',vTbl:'tbl',vWc:'wc',vAiWc:'aiwc',vInd:'ind',vPri:'pri',vMet:'met'};
    for(var mid in map){ var mel=document.getElementById(mid); if(mel) mel.style.display=v===map[mid]?'':'none'; }
    if(v==='wc'&&typeof renderWC==='function') renderWC();
    if(v==='aiwc'&&typeof renderAiWc==='function') renderAiWc();
    if(v==='ind') renderIndustryData();
    if(v==='pri') renderPriorityIndustries();
  };
  window.showView=showView;

  renderIndustryData();
  renderPriorityIndustries();
  showView((location.hash||'#take').replace('#',''));
})();
/* ---- end industry tabs patch ---- */


