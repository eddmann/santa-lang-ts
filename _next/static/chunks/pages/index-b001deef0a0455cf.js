(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[405],{8312:function(a,b,c){(window.__NEXT_P=window.__NEXT_P||[]).push(["/",function(){return c(8140)}])},8140:function(a,b,c){"use strict";c.r(b),c.d(b,{default:function(){return q}});var d=c(828),e=c(5893),f=c(7294),g=c(9008),h=c.n(g),i=c(5152),j=c.n(i),k=c(2770);function l(){return(0,e.jsxs)("nav",{style:{height:32,backgroundColor:"#efefef",borderBottom:"1px solid #ddd",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 16px"},children:[(0,e.jsx)("div",{children:"santa-lang"}),(0,e.jsx)("div",{})]})}var m=j()(function(){return Promise.all([c.e(762),c.e(549),c.e(143)]).then(c.bind(c,8143))},{loadableGenerated:{webpack:function(){return[8143]}},ssr:!1}),n=function(a,b,c,d){for(var e="editor:".concat(b+1,":").concat(c+1,"\n\n"),f=a.split("\n"),g=0;g<f.length;g++)if(!(g<b-2)&&!(g>b+2)){var h="".concat(g+1).padStart(2," ")+": ";g===b?(e+="".concat(h).concat(f[g],"\n"),e+=" ".repeat(c+h.length)+"^~~\n"):e+="".concat(h).concat(f[g],"\n")}return(e+="\n"+d+"\n")+"\n"},o=function(a){return"".concat(Math.floor(a/1e3),".").concat(a%1e3)},p=function(){var a=(0,f.useState)(""),b=a[0],g=a[1],h=(0,f.useState)(""),i=h[0],j=h[1],l=(0,f.useState)(!1),p=l[0],q=l[1],r=(0,f.useRef)();(0,f.useEffect)(function(){return r.current=new Worker(c.tu(new URL(c.p+c.u(452),c.b))),r.current.onmessage=function(a){q(!1);var b=a.data;if(b.error){j(n(b.source,b.error.line,b.error.column,b.error.message));return}var c="";switch(b.type){case"run":var e=b.result;if(e.value){j(e.value);return}e.partOne&&(c+="Part 1: ".concat(e.partOne.value," ").concat(o(e.partOne.duration),"s\n")),e.partTwo&&(c+="Part 2: ".concat(e.partTwo.value," ").concat(o(e.partTwo.duration),"s\n")),j(c);return;case"test":var f=b.testCases,g=!0,h=!1,i=void 0;try{for(var k,l=Object.entries(f)[Symbol.iterator]();!(g=(k=l.next()).done);g=!0){var m=(0,d.Z)(k.value,2),p=m[0],r=m[1];if(+p>0&&(c+="\n"),c+="Testcase ".concat(+p+1,"\n"),!r){c+="No expectations\n";continue}r.partOne&&(r.partOne.hasPassed?c+="Part 1: ".concat(r.partOne.actual," ✔️\n"):c+="Part 1: ".concat(r.partOne.actual," ✘ (Expected: ").concat(r.partOne.expected,")\n")),r.partTwo&&(r.partTwo.hasPassed?c+="Part 2: ".concat(r.partTwo.actual," ✔️\n"):c+="Part 2: ".concat(r.partTwo.actual," ✘ (Expected: ").concat(r.partTwo.expected,")\n"))}}catch(s){h=!0,i=s}finally{try{g||null==l.return||l.return()}finally{if(h)throw i}}j(c);return;case"tokenize":case"parse":return}},function(){r.current&&r.current.terminate()}},[]);var s=(0,f.useCallback)(function(){!p&&(q(!0),j("Running..."),r.current&&r.current.postMessage({type:"run",source:b}))},[b,p]),t=(0,f.useCallback)(function(){!p&&(q(!0),j("Testing..."),r.current&&r.current.postMessage({type:"test",source:b}))},[b,p]),u=function(a){fetch(a.target.value).then(function(a){return a.text()}).then(g)};return(0,e.jsxs)("div",{children:[(0,e.jsxs)("div",{style:{backgroundColor:"#efefef",borderBottom:"1px solid #ddd",height:32,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 10px"},children:[(0,e.jsx)("div",{children:(0,e.jsxs)("select",{onChange:u,defaultValue:"title",children:[(0,e.jsx)("option",{value:"title",disabled:!0,children:"Select an example..."}),(0,e.jsx)("option",{value:"https://raw.githubusercontent.com/eddmann/advent-of-code/master/2018/santa-lang/aoc2018_day01.santa",children:"aoc2018_day01.santa"}),(0,e.jsx)("option",{value:"https://raw.githubusercontent.com/eddmann/advent-of-code/master/2018/santa-lang/aoc2018_day02.santa",children:"aoc2018_day02.santa"}),(0,e.jsx)("option",{value:"https://raw.githubusercontent.com/eddmann/advent-of-code/master/2018/santa-lang/aoc2018_day03.santa",children:"aoc2018_day03.santa"}),(0,e.jsx)("option",{value:"https://raw.githubusercontent.com/eddmann/advent-of-code/master/2018/santa-lang/aoc2018_day04.santa",children:"aoc2018_day04.santa"}),(0,e.jsx)("option",{value:"https://raw.githubusercontent.com/eddmann/advent-of-code/master/2018/santa-lang/aoc2018_day05.santa",children:"aoc2018_day05.santa"}),(0,e.jsx)("option",{value:"https://raw.githubusercontent.com/eddmann/advent-of-code/master/2018/santa-lang/aoc2018_day06.santa",children:"aoc2018_day06.santa"}),(0,e.jsx)("option",{value:"https://raw.githubusercontent.com/eddmann/advent-of-code/master/2018/santa-lang/aoc2018_day07.santa",children:"aoc2018_day07.santa"}),(0,e.jsx)("option",{value:"https://raw.githubusercontent.com/eddmann/advent-of-code/master/2018/santa-lang/aoc2018_day08.santa",children:"aoc2018_day08.santa"}),(0,e.jsx)("option",{value:"https://raw.githubusercontent.com/eddmann/advent-of-code/master/2018/santa-lang/aoc2018_day09.santa",children:"aoc2018_day09.santa"}),(0,e.jsx)("option",{value:"https://raw.githubusercontent.com/eddmann/advent-of-code/master/2018/santa-lang/aoc2018_day10.santa",children:"aoc2018_day10.santa"}),(0,e.jsx)("option",{value:"https://raw.githubusercontent.com/eddmann/advent-of-code/master/2018/santa-lang/aoc2018_day11.santa",children:"aoc2018_day11.santa"})]})}),(0,e.jsxs)("div",{children:[(0,e.jsx)("button",{onClick:t,disabled:p,children:"Test"})," ",(0,e.jsx)("button",{onClick:s,disabled:p,children:"Run"})]})]}),(0,e.jsxs)(k.Z,{direction:"vertical",style:{height:"calc(100vh - 64px)"},sizes:[60,40],minSize:[200,200],children:[(0,e.jsx)("div",{children:(0,e.jsx)(m,{onChange:g,source:b})}),(0,e.jsx)("pre",{style:{margin:0,padding:"20px",overflowY:"scroll",fontFamily:"monospace",fontSize:16},children:i})]})]})},q=function(){return(0,e.jsxs)("div",{children:[(0,e.jsxs)(h(),{children:[(0,e.jsx)("title",{children:"santa-lang"}),(0,e.jsx)("meta",{name:"viewport",content:"width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"})]}),(0,e.jsxs)("div",{children:[(0,e.jsx)(l,{}),(0,e.jsx)(p,{})]})]})}}},function(a){a.O(0,[742,774,888,179],function(){var b;return a(a.s=8312)}),_N_E=a.O()}])