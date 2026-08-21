import React from 'react'
import { useState } from 'react'
import { useEffect } from 'react'
import { useRef } from 'react'
import { useCallback } from 'react'
import { MapContainer } from 'react-leaflet'
import { TileLayer, GeoJSON, Pane } from 'react-leaflet'
import { Polyline } from 'react-leaflet'
import { CircleMarker } from 'react-leaflet'
import { Tooltip } from 'react-leaflet'
import { Popup } from 'react-leaflet'
import { useMap } from 'react-leaflet'
import { AreaChart } from 'recharts'
import { Area } from 'recharts'
import { BarChart } from 'recharts'
import { Bar } from 'recharts'
import { XAxis } from 'recharts'
import { YAxis } from 'recharts'
import { ResponsiveContainer } from 'recharts'
import { CartesianGrid } from 'recharts'
import { Cell } from 'recharts'
import { motion } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'
import { ShieldAlert } from 'lucide-react'
import { Ship } from 'lucide-react'
import { Droplet } from 'lucide-react'
import { Radio } from 'lucide-react'
import { Activity } from 'lucide-react'
import { Globe } from 'lucide-react'
import { TrendingDown } from 'lucide-react'
import { Zap } from 'lucide-react'
import { Eye } from 'lucide-react'
import { Play } from 'lucide-react'
import { Wifi } from 'lucide-react'
import 'leaflet/dist/leaflet.css'
import './index.css'
function MapController({flyto}){
const map=useMap()
useEffect(()=>{
if(flyto){map.flyTo(flyto,5,{duration:1.5})}
},[flyto, map])
return null
}
class ErrorBoundary extends React.Component{
constructor(props){super(props);this.state={haserror:false}}
static getDerivedStateFromError(){return{haserror:true}}
render(){
if(this.state.haserror){return<div className="flex items-center justify-center h-full bg-[#0f1722] text-[#b5a642] text-sm font-mono">System recovery in progress...</div>}
return this.props.children
}
}
export default function App(){
const[matrixdata,setmatrixdata]=useState(null)
const[connected,setconnected]=useState(false)
const[currentmode,setcurrentmode]=useState("demo")
const[flyto,setflyto]=useState(null)
const[selectedroute,setselectedroute]=useState(0)
const[typedreport,settypedreport]=useState("")
const[newsQueue,setNewsQueue]=useState([])
const[worldGeo,setWorldGeo]=useState(null)
const[indiaGeo,setIndiaGeo]=useState(null)
const socketref=useRef(null)
const reportref=useRef("")
const typetimerref=useRef(null)
const moderef=useRef("demo")
useEffect(()=>{
fetch("/world.json").then(r=>r.json()).then(data=>setWorldGeo(data)).catch(e=>console.error("Failed to load map data"))
fetch("/india.json").then(r=>r.json()).then(data=>setIndiaGeo(data)).catch(e=>console.error("Failed to load India data"))
let reconnecttimer=null
let ismounted=true
const connectws=()=>{
const issecure=window.location.protocol==="https:"
const protocol=issecure?"wss://":"ws://"
const host=import.meta.env.VITE_WS_HOST||(window.location.hostname+":8000")
const wsurl=protocol+host+"/ws"
const socket=new WebSocket(wsurl)
socketref.current=socket
socket.onopen=()=>{
if(!ismounted)return
setconnected(true)
socket.send(JSON.stringify({mode:moderef.current}))
}
socket.onmessage=(event)=>{
if(!ismounted)return
try{
const data=JSON.parse(event.data)
if(data.mode&&data.mode!==moderef.current){
return
}
setmatrixdata(data)
if(data.news){
setNewsQueue(prev=>{
if(prev.length===0||prev[0]!==data.news){
return[data.news,...prev].slice(0,50)
}
return prev
})
}
if(data.report&&data.report!==reportref.current){
reportref.current=data.report
settypedreport("")
if(typetimerref.current)clearInterval(typetimerref.current)
let i=0
const fullReport=data.report
typetimerref.current=setInterval(()=>{
if(i<fullReport.length){
settypedreport(fullReport.substring(0, i+1))
i++
}else{
clearInterval(typetimerref.current)
}
},15)
}
}catch(e){console.error(e)}
}
socket.onclose=()=>{
if(!ismounted)return
setconnected(false)
reconnecttimer=setTimeout(connectws,3000)
}
socket.onerror=()=>{
if(!ismounted)return
setconnected(false)
}
}
connectws()
return()=>{
ismounted=false
if(socketref.current)socketref.current.close()
if(typetimerref.current)clearInterval(typetimerref.current)
if(reconnecttimer)clearTimeout(reconnecttimer)
}
},[])
const switchmode=useCallback((mode)=>{
setcurrentmode(mode)
moderef.current=mode
setselectedroute(0)
setNewsQueue([])
if(socketref.current&&socketref.current.readyState===1){
socketref.current.send(JSON.stringify({mode:mode}))
}
},[])
const rankedroutes=matrixdata?.routes||[]
const corridorrisks=matrixdata?.corridorrisks||{}
const drawdown=matrixdata?.drawdown||{}
const gridstats=matrixdata?.gridstats||{}
const sprmetadata=matrixdata?.sprmetadata||{}
const demoinfo=matrixdata?.demoinfo||{}
const riskcorridors=[
{name:"Hormuz",key:"hormuz"},
{name:"Red Sea",key:"redsea"},
{name:"Suez",key:"suez"},
{name:"Malacca",key:"malacca"},
{name:"W.Africa",key:"westafrica"},
{name:"Americas",key:"americas"},
{name:"US Gulf",key:"usgulf"},
{name:"Pacific",key:"pacific"},
{name:"Cape",key:"cape"}
]
function getRiskColor(risk) {
  if (risk >= 0.75) return "#8b0000";
  if (risk >= 0.40) return "#b5a642";
  return "#4b5563";
}
const sprtimelinedata=[
{day:"Normal",spr:sprmetadata?.coveragedays||9.5},
{day:"Current",spr:drawdown?.sprremainingdays||9.5},
{day:"Projected",spr:Math.max(0,(drawdown?.sprremainingdays||9.5)-2)}
]
const routecostdata=(rankedroutes||[]).slice(0,6).map((r)=>({
name:(r?.destination||"Rt").split(' (')[0].substring(0,12),
cost:r?.totalcost||0
}))
const refineries=[
[22.47,70.06,"Jamnagar (RIL)",1240000],[22.48,70.07,"Jamnagar SEZ",580000],
[22.37,69.72,"Vadinar",400000],[19.08,72.88,"Mumbai",300000],
[9.93,76.27,"Kochi",310000],[13.08,80.27,"Chennai",210000],
[20.32,86.61,"Paradip",300000],[22.07,88.10,"Haldia",160000],
[17.69,83.22,"Vizag",166000],[12.87,74.88,"Mangalore",300000],
[29.39,76.96,"Panipat",300000],[27.49,77.67,"Mathura",160000],
[24.18,78.13,"Bina",156000],[30.21,74.95,"Bathinda",180000],
[26.63,93.72,"Numaligarh",60000]
]
const sprlocations=[
[17.72,83.30,"Vizag SPR",1.33],[12.90,74.85,"Mangalore SPR",1.50],
[12.65,74.90,"Padur SPR",2.50],[20.75,86.05,"Chandikhol SPR",4.00]
]
const originports=[
[26.65,50.15,"Ras Tanura","Saudi Arabia"],[29.69,48.80,"Basra","Iraq"],
[25.13,56.33,"Fujairah","UAE"],[29.23,50.32,"Kharg Island","Iran"],
[29.08,48.08,"Al Ahmadi","Kuwait"],[24.35,56.75,"Sohar","Oman"],
[24.09,38.06,"Yanbu","Saudi Arabia"],[21.49,39.19,"Jeddah","Saudi Arabia"],
[44.72,37.77,"Novorossiysk","Russia"],[60.35,28.60,"Primorsk","Russia"],
[59.68,28.40,"Ust-Luga","Russia"],[68.96,33.08,"Murmansk","Russia"],
[42.75,132.90,"Kozmino","Russia"],[36.88,35.95,"Ceyhan","Turkey"],
[4.43,7.17,"Bonny","Nigeria"],[5.60,5.20,"Escravos","Nigeria"],
[-8.84,13.23,"Luanda","Angola"],[5.63,-0.02,"Tema","Ghana"],
[28.89,-90.03,"LOOP Terminal","USA"],[29.76,-95.37,"Houston","USA"],
[10.22,-64.62,"Puerto La Cruz","Venezuela"],[10.15,-64.73,"Jose Terminal","Venezuela"],
[-23.01,-44.32,"Angra dos Reis","Brazil"],[-33.01,17.93,"Saldanha Bay","South Africa"],
[27.93,-110.90,"Guaymas","Mexico"]
]
const chokepoints=[
[26.57,56.25,"Strait of Hormuz",21],[12.58,43.33,"Bab el-Mandeb",6.2],
[30.45,32.35,"Suez Canal",5.5],[-34.36,18.47,"Cape of Good Hope",99],
[2.50,101.50,"Strait of Malacca",16],[-15.00,41.00,"Mozambique Ch.",99]
]
function getthreatclass(risk){
if(risk>=0.7)return"threat-critical"
if(risk>=0.4)return"threat-high"
if(risk>=0.2)return"threat-moderate"
return"threat-low"
}
return(
<ErrorBoundary>
<div className="flex flex-col h-screen w-screen bg-gray-950 text-white overflow-hidden relative">
<motion.header initial={{y:-50,opacity:0}} animate={{y:0,opacity:1}} transition={{ type: "tween", duration: 0.2, ease: "linear" }} className="absolute top-0 left-0 w-full h-10 flex items-center justify-between z-[2000] pointer-events-none">
<div className="flex items-center h-full pointer-events-auto border-b border-white/5 glass-panel px-6 w-full justify-between">
<div className="flex items-center gap-4">
<div className="w-4 h-4 bg-[#b5a642] flex items-center justify-center opacity-90">
<div className="w-1.5 h-1.5 border-[1px] border-black rounded-none"></div>
</div>
<div className="flex items-baseline gap-3">
<span className="text-[11px] font-bold tracking-[0.2em] text-gray-200 uppercase font-sans">India Energy Command</span>
<span className="text-[9px] font-mono text-gray-600 tracking-wider">IEC-OPCEN</span>
</div>
</div>
<div className="flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
<div className="flex items-center gap-2.5 text-[9px] font-mono text-gray-500 bg-black/20 px-3 py-1 border border-white/5">
<span className="text-gray-400 mr-1">NET:</span>
<span>{gridstats?.refineries||0}R</span>
<span>{gridstats?.originports||0}P</span>
<span>{gridstats?.chokepoints||0}C</span>
<span>{gridstats?.edges||0}E</span>
</div>
{currentmode==="demo" && demoinfo?.poolsize>0 && (
<div className="flex items-center gap-3 bg-black/20 px-3 py-1 border border-white/5">
<span className="text-[9px] font-mono text-[#b5a642]">SEQ: {String(demoinfo.currentindex+1).padStart(2,'0')}/{String(demoinfo.poolsize).padStart(2,'0')}</span>
<div className="w-20 h-[2px] bg-black/60 relative overflow-hidden">
<div className="absolute top-0 left-0 h-full bg-[#b5a642] transition-all duration-300" style={{width:`${((demoinfo.currentindex+1)/demoinfo.poolsize)*100}%`}}/>
</div>
</div>
)}
</div>
<div className="flex items-center gap-4">
<div className="flex items-center gap-3 bg-black/20 px-4 py-1 border border-white/5 text-[10px] font-mono tracking-widest">
<button onClick={()=>switchmode("demo")} className={`transition-colors ${currentmode==="demo"?'text-white':'text-gray-600 hover:text-gray-400'}`}>SIM</button>
<span className="text-gray-800">|</span>
<button onClick={()=>switchmode("live")} className={`transition-colors ${currentmode==="live"?'text-[#8b0000]':'text-gray-600 hover:text-gray-400'}`}>LIVE</button>
</div>
<div className="flex items-center gap-2 ml-2">
<div className={`w-1.5 h-1.5 ${connected?'bg-[#b5a642] led-glow-gold':'bg-red-500 led-glow-crimson'}`}/>
<span className="text-[9px] font-mono text-gray-400 tracking-wider pr-4">{connected?"SYS_ONLINE":"SYS_ERROR"}</span>
</div>
</div>
</div>
</motion.header>

<div className="absolute inset-0 z-0 pt-12">
<div className="map-vignette"/>
<div className="map-graticule"/>
<MapContainer center={[20.0,50.0]} zoom={3} style={{width:"100%",height:"100%"}} zoomControl={false} attributionControl={false}>
<Pane name="basemap" style={{ zIndex: 200 }}>
{worldGeo && <GeoJSON data={worldGeo} style={{fillColor:"#1f2937", color:"#374151", weight:0.8, opacity: 0.5, fillOpacity:1}} />}
{indiaGeo && <GeoJSON data={indiaGeo} style={{fillColor:"#374151", color:"#4b5563", weight:1, opacity: 0.8, fillOpacity:1}} />}
</Pane>
<MapController flyto={flyto}/>
{(rankedroutes||[]).slice(0,10).map((r,i)=>{
const isselected=i===selectedroute
const coords=r?.coordinates||[]
if(!Array.isArray(coords)||coords.length<2)return null
return(
<Polyline key={i} positions={coords} color={isselected?'#b5a642':'#1f2937'} weight={isselected?2:1} opacity={isselected?1:0.6} dashArray="8,8" eventHandlers={{click:()=>{setselectedroute(i);if(coords.length>0)setflyto(coords[0])}}}>
<Tooltip sticky className="!bg-[#131d26] !border-[#b5a642] !text-gray-400 shadow-[4px_4px_0px_rgba(0,0,0,0.8)] rounded-none">
<div className="text-[10px] font-mono p-1">
<p className="font-bold text-gray-400">{r?.origin||"--"} → {r?.destination||"--"}</p>
<p className="text-gray-400">Cost: ${(r?.totalcost||0).toFixed(0)} | {r?.transitdays||0}d | {r?.distancenm||0}nm</p>
<p className="text-gray-500">Country: {r?.origincountry||"--"} | Corridor: {r?.origincorridor||"--"}</p>
{r?.chokepoints&&r.chokepoints.length>0&&<p className="text-[#8b0000]">Chokepoints: {r.chokepoints.join(", ")}</p>}
</div>
</Tooltip>
</Polyline>
)})}
{refineries.map((r,i)=>(
<CircleMarker key={`ref-${i}`} center={[r[0],r[1]]} radius={Math.max(3,Math.sqrt(r[3]/80000))} color="#3b82f6" fillColor="#60a5fa" fillOpacity={0.7} weight={2}>
<Popup><div className="text-[10px]"><p className="font-bold text-gray-400">{r[2]}</p><p className="text-gray-400 font-mono">{(r[3]/1000).toFixed(0)}K BPD</p><p className="text-gray-500">Indian Refinery</p></div></Popup>
</CircleMarker>
))}
{sprlocations.map((s,i)=>(
<CircleMarker key={`spr-${i}`} center={[s[0],s[1]]} radius={6} color="#9333ea" fillColor="#a855f7" fillOpacity={0.7} weight={2}>
<Popup><div className="text-[10px]"><p className="font-bold text-gray-400">{s[2]}</p><p className="text-gray-400 font-mono">{s[3]}M tonnes</p><p className="text-gray-500">Strategic Petroleum Reserve</p></div></Popup>
</CircleMarker>
))}
{originports.map((o,i)=>(
<CircleMarker key={`org-${i}`} center={[o[0],o[1]]} radius={4} color="#9ca3af" fillColor="#e5e7eb" fillOpacity={0.8} weight={2}>
<Popup><div className="text-[10px]"><p className="font-bold text-gray-400">{o[2]}</p><p className="text-gray-400">{o[3]}</p><p className="text-gray-500">Crude Origin Port</p></div></Popup>
</CircleMarker>
))}
{chokepoints.map((c,i)=>{
const cpToCorridor={"Strait of Hormuz":"hormuz","Bab el-Mandeb":"redsea","Suez Canal":"suez","Cape of Good Hope":"cape","Strait of Malacca":"malacca","Mozambique Ch.":"cape"};
const cpRisk = corridorrisks[cpToCorridor[c[2]]] || 0;
const isHighRisk = cpRisk > 0.4;
return (
<CircleMarker key={`chk-${i}`} center={[c[0],c[1]]} radius={isHighRisk?6:4} color="#b5a642" fillColor="#b5a642" fillOpacity={0.8} weight={2}>
<Tooltip direction="right" offset={[8,0]} className="!bg-transparent !border-0 !shadow-none !p-0"><span className="text-[8px] font-mono text-[#b5a642] bg-black/80 px-1 py-0.5 rounded-none">{c[2]}</span></Tooltip>
<Popup><div className="text-[10px]"><p className="font-bold text-[#8b0000]">{c[2]}</p><p className="text-gray-400 font-mono">{c[3]}M BPD capacity</p><p className="text-gray-500">Maritime Chokepoint</p></div></Popup>
</CircleMarker>
)})}
</MapContainer>
<motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{ type: "tween", duration: 0.2, ease: "linear" }} className="absolute top-16 right-6 z-[1000] glass-panel p-3 rounded-none pointer-events-none">
<div className="flex items-center gap-1.5 mb-2"><span className="text-[9px] font-bold clean-header text-gray-400">Legend</span></div>
<div className="flex flex-col gap-2 text-[10px]">
<div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-blue-500"/><span className="text-gray-400">Refinery</span></div>
<div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-purple-500"/><span className="text-gray-400">SPR</span></div>
<div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-gray-300"/><span className="text-gray-400">Origin Port</span></div>
<div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[#b5a642] led-glow-gold"/><span className="text-gray-400">High Risk Chokepoint</span></div>
</div>
</motion.div>
</div>

<motion.div initial={{x:-320,opacity:0}} animate={{x:0,opacity:1}} transition={{ type: "tween", duration: 0.3, ease: "easeOut" }} className="absolute top-12 left-0 bottom-0 w-[300px] z-[1000] glass-panel p-5 overflow-y-auto flex flex-col gap-8 ">
<div>
<div className="flex items-center gap-2 mb-3">
<h2 className="text-[10px] font-bold clean-header text-gray-300 tracking-[0.08em]">Corridor Risk Matrix</h2>
</div>
<div className="flex flex-col gap-1.5">
{riskcorridors.map((c)=>{
const risk=corridorrisks?.[c.key]||0
return(
<motion.div key={c.key} initial={{x:-15,opacity:0}} animate={{x:0,opacity:1}} transition={{ type: "tween", duration: 0.2, ease: "linear" }} className={`p-1.5 rounded-none text-[11px] ${getthreatclass(risk)} flex items-center justify-between`}>
<span className="font-medium">{c.name}</span>
<div className="flex items-center gap-2">
<div className="w-16 h-1 bg-gray-800 rounded-none overflow-hidden">
<motion.div initial={{width:0}} animate={{width:`${risk*100}%`}} transition={{ type: "tween", duration: 0.2, ease: "linear" }} className="h-full rounded-none" style={{background:getRiskColor(risk)}}/>
</div>
<span className="font-mono w-8 text-right text-[10px]" style={{color:getRiskColor(risk)}}>{(risk*100).toFixed(0)}%</span>
</div>
</motion.div>
)})}
</div>
</div>
<div className=" pt-6 pb-2">
<div className="text-gray-500 text-[10px] font-semibold uppercase tracking-[0.08em] mb-1">Strategic Reserve Capacity</div>
<div className="text-6xl font-bold font-mono text-gray-100 leading-none tracking-tighter my-2">{(drawdown?.sprremainingdays||0).toFixed(1)}<span className="text-2xl text-gray-600 font-sans tracking-normal ml-1">d</span></div>
<div className="text-[11px] text-white/40 mt-4 flex flex-col gap-1.5 min-w-[200px]">
<div className="flex justify-between"><span>Status:</span> <span className={drawdown?.status==="Stable"?'text-gray-400':'text-[#8b0000] font-bold'}>{drawdown?.status||"Stable"}</span></div>
<div className="flex justify-between"><span>Drawdown:</span> <span className="font-mono">{(drawdown?.drawdowndays||0).toFixed(1)}d</span></div>
<div className="flex justify-between"><span>GDP Impact:</span> <span className="font-mono text-[#8b0000]">-${((drawdown?.gdppenalty||0)/1000000000).toFixed(2)}B</span></div>
</div>
</div>
<div className=" pt-6 pb-2">
<div className="flex items-center gap-2 mb-3">
<h2 className="text-[10px] font-bold clean-header text-gray-300 tracking-[0.08em]">Intelligence Feed</h2>
</div>
<div className="flex flex-col gap-3 relative">
{newsQueue.length>0?newsQueue.map((item,idx)=>(
<p key={idx} className={`text-[11px] leading-relaxed transition-all duration-300 ${idx===0?'text-gray-200 font-medium':'text-gray-600 border-l border-white/10 pl-2'}`}>{item}</p>
)):(
<p className="text-[11px] text-gray-500 leading-relaxed italic">Awaiting intelligence feed...</p>
)}
</div>
</div>
</motion.div>

<motion.div initial={{y:50,opacity:0}} animate={{y:0,opacity:1}} transition={{ type: "tween", duration: 0.3, ease: "easeOut" }} className="absolute bottom-6 right-6 z-[1000] glass-panel p-4 w-72 rounded-none">
<div className="flex items-center gap-2 mb-3">
<h2 className="text-[10px] font-bold clean-header text-gray-300 tracking-[0.08em]">Cost Analysis</h2>
</div>
<div className="h-32 w-full">
<ResponsiveContainer width="100%" height="100%">
<BarChart data={routecostdata} barSize={12}>
<CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false}/>
<XAxis dataKey="name" tick={{fontSize:7,fill:"#6b7280",angle:-35,textAnchor:"end",dy:10}} interval={0} axisLine={false} tickLine={false} height={40}/>
<YAxis tick={{fontSize:9,fill:'#6b7280',fontFamily:'JetBrains Mono'}} axisLine={false} tickLine={false} width={30}/>
<Bar dataKey="cost" radius={[0,0,0,0]}>
{routecostdata.map((entry,i)=>(<Cell key={i} fill={i===0?'url(#goldGradient)':'#374151'}/>))}
</Bar>
<defs>
<linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#b5a642"/><stop offset="100%" stopColor="#7c722e"/></linearGradient>
</defs>
</BarChart>
</ResponsiveContainer>
</div>
</motion.div>

<motion.div initial={{y:50,opacity:0}} animate={{y:0,opacity:1}} transition={{ type: "tween", duration: 0.3, ease: "easeOut", delay:0.1 }} className="absolute bottom-6 left-[340px] right-[320px] z-[1000] glass-panel p-4 rounded-none max-w-2xl mx-auto flex flex-col max-h-[300px]">
<div className="flex items-center gap-2 mb-3 shrink-0">
<h2 className="text-[10px] font-bold clean-header text-gray-300 tracking-[0.08em]">Procurement Operations</h2>
<span className="text-[10px] font-mono text-gray-500 ml-auto bg-white/5 px-2 py-0.5 rounded-none">{(rankedroutes||[]).length} ACTIVE CORRIDORS</span>
</div>
<div className="mb-4 p-3 border-l-2 border-[#b5a642] bg-white/5 rounded-none shrink-0">
<div className="flex items-center gap-2 mb-1"><div className="w-1.5 h-1.5 bg-[#b5a642] rounded-none animate-pulse led-glow-gold"></div><span className="text-[9px] font-bold tracking-[0.12em] text-[#b5a642] uppercase">Live Intelligence Integration</span></div>
<p className="text-[11px] text-gray-200 leading-relaxed font-sans">{typedreport||"Awaiting routing directive..."}<span className="animate-pulse text-[#b5a642] ml-0.5">|</span></p>
</div>
<div className="flex flex-col gap-1 overflow-y-auto pr-2 flex-1">
<div className="grid grid-cols-[16px_1fr_40px_50px_50px] gap-3 text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1 pb-1 ">
<span>#</span><span>Origin → Destination</span><span className="text-right">Days</span><span className="text-right">Cost</span><span className="text-right">Dist</span>
</div>
{(rankedroutes||[]).slice(0,5).map((r,i)=>{
const maxcost=(rankedroutes||[]).length>0?(rankedroutes[rankedroutes.length-1]?.totalcost||1):1
return(
<motion.div key={i} initial={{x:-15,opacity:0}} animate={{x:0,opacity:1}} transition={{ type: "tween", duration: 0.2, ease: "linear" }} onClick={()=>{setselectedroute(i);const coords=r?.coordinates;if(Array.isArray(coords)&&coords.length>0)setflyto(coords[0])}} className={`grid grid-cols-[16px_1fr_40px_50px_50px] gap-3 items-center p-1.5 rounded-none cursor-pointer transition-all text-[11px] ${i===selectedroute?'bg-[#b5a642]/10 border-l border-[#b5a642]':'hover:bg-white/5 border-l border-transparent'}`}>
<span className={`font-bold ${i===selectedroute?'text-[#b5a642]':'text-gray-600'}`}>{i+1}</span>
<div className="min-w-0">
<p className={`font-medium truncate ${i===selectedroute?'text-gray-200':'text-gray-400'}`}>{r?.origin||"--"} → {r?.destination||"--"}</p>
<div className="h-0.5 bg-gray-800 rounded-none overflow-hidden mt-1">
<div className="h-full rounded-none transition-all duration-700" style={{width:`${Math.max(5,100-((r?.totalcost||0)/maxcost)*80)}%`,background:i===0?'#b5a642':'#374151'}}/>
</div>
</div>
<span className="font-mono text-gray-400 text-right">{r?.transitdays||0}d</span>
<span className="font-mono text-gray-400 text-right">${(r?.totalcost||0).toFixed(0)}</span>
<span className="font-mono text-gray-500 text-right">{r?.distancenm||0}nm</span>
</motion.div>
)})}
</div>
</motion.div>

</div>
</ErrorBoundary>
)
}