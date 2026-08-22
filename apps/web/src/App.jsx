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
import { Tooltip as RechartsTooltip } from 'recharts'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { ChevronUp } from 'lucide-react'
import { Maximize2 } from 'lucide-react'
import { X } from 'lucide-react'
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
const[indiaStatesGeo,setIndiaStatesGeo]=useState(null)
const[matrixExpanded,setMatrixExpanded]=useState(false)
const[expandedCorridor,setExpandedCorridor]=useState(null)
const[sprExpanded,setSprExpanded]=useState(false)
const[opsExpanded,setOpsExpanded]=useState(false)
const[costExpanded,setCostExpanded]=useState(false)
const[intelExpanded,setIntelExpanded]=useState(false)
const socketref=useRef(null)
const reportref=useRef("")
const typetimerref=useRef(null)
const moderef=useRef("demo")
useEffect(()=>{
fetch("/world.json").then(r=>r.json()).then(data=>setWorldGeo(data)).catch(e=>console.error("Failed to load map data"))
fetch("/india.json").then(r=>r.json()).then(data=>setIndiaGeo(data)).catch(e=>console.error("Failed to load India data"))
fetch("/india_states.json").then(r=>r.json()).then(data=>setIndiaStatesGeo(data)).catch(e=>console.error("Failed to load India states data"))
let reconnecttimer=null
let ismounted=true
const connectws=()=>{
const issecure=window.location.protocol==="https:"
const protocol=issecure?"wss://":"ws://"
const host=window.location.hostname==="localhost"?"localhost:8000":"prisme-backend-mduw.onrender.com"
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
setmatrixdata(null)
settypedreport("")
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
const corridorKeywords={hormuz:["hormuz","iran","persian gulf","strait of hormuz"],redsea:["red sea","houthi","yemen","bab el-mandeb","bab al-mandab","aden"],suez:["suez","suez canal","egypt","sinai"],malacca:["malacca","singapore","southeast asia","taiwan","south china"],westafrica:["nigeria","angola","west africa","gulf of guinea","bonny","congo"],americas:["venezuela","brazil","americas","caribbean","guyana"],usgulf:["us gulf","houston","loop terminal","gulf of mexico","texas"],pacific:["pacific","kozmino","russia pacific","sakhalin"],cape:["cape","south africa","good hope","saldanha"]}
function getCorridorNews(corridorKey){
return(newsQueue||[]).filter(news=>{
const lower=news.toLowerCase()
return(corridorKeywords[corridorKey]||[]).some(kw=>lower.includes(kw))
})
}
function getNewsSentiment(news){
const lower=news.toLowerCase()
const negativeWords=["attack","strike","missile","bomb","crisis","escalat","threat","risk","disrupt","block","close","shut","war","conflict","tension","sabotage","piracy","hijack","sanction","embargo","drone","ablaze","fire","explosion","halt","suspend","damage","drops","deficit","shortage"]
const positiveWords=["peace","stable","resume","open","agreement","deal","ceasefire","recover","improve","boost","invest","growth","secure","safe","protect","diversif","ramp","surge","increase","renewable"]
const negScore=negativeWords.filter(w=>lower.includes(w)).length
const posScore=positiveWords.filter(w=>lower.includes(w)).length
if(negScore>posScore)return"negative"
if(posScore>negScore)return"positive"
return"neutral"
}
function getSentimentColor(sentiment){
if(sentiment==="negative")return{text:"text-red-400",bg:"bg-red-500/10",border:"border-red-500/20",dot:"bg-red-500"}
if(sentiment==="positive")return{text:"text-emerald-400",bg:"bg-emerald-500/10",border:"border-emerald-500/20",dot:"bg-emerald-500"}
return{text:"text-yellow-400",bg:"bg-yellow-500/10",border:"border-yellow-500/20",dot:"bg-yellow-500"}
}
const sprtimelinedata=[
{day:"Normal",spr:sprmetadata?.coveragedays ?? 9.5},
{day:"Current",spr:drawdown?.sprremainingdays ?? 9.5},
{day:"Projected",spr:Math.max(0,(drawdown?.sprremainingdays ?? 9.5)-2)}
]
const routecostdata=(rankedroutes||[]).slice(0,6).map((r)=>({
name:(r?.origin||"Rt").substring(0,12),
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
<div className="flex items-center gap-4 cursor-default" title="PRISME (Predictive Risk & Inventory Simulation for Maritime Energy) — AI-powered supply chain resilience platform">
<div className="w-4 h-4 bg-[#b5a642] flex items-center justify-center opacity-90 hover:opacity-100 transition-opacity">
<div className="w-1.5 h-1.5 border-[1px] border-black rounded-none"></div>
</div>
<div className="flex items-baseline gap-3">
<span className="text-[11px] font-bold tracking-[0.2em] text-[#b5a642] uppercase font-sans hover:text-white transition-colors">PRISME <span className="text-gray-200">| India's Energy Command</span></span>
<span className="text-[9px] font-mono text-gray-600 tracking-wider hover:text-gray-400 transition-colors" title="Operations Center Identifier">IEC-OPCEN</span>
</div>
</div>
<div className="flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
<div className="flex items-center gap-2.5 text-[9px] font-mono text-gray-500 bg-black/20 px-3 py-1 border border-white/5 hover:border-white/15 hover:bg-black/30 transition-all cursor-default" title="Network Topology — Refineries, Ports, Chokepoints, Edges in the maritime routing graph">
<span className="text-gray-400 mr-1">NET:</span>
<span title="Active Refineries">{gridstats?.refineries||0}R</span>
<span title="Origin Ports">{gridstats?.originports||0}P</span>
<span title="Maritime Chokepoints">{gridstats?.chokepoints||0}C</span>
<span title="Routing Edges">{gridstats?.edges||0}E</span>
</div>
{currentmode==="demo" && demoinfo?.poolsize>0 && (
<div className="flex items-center gap-3 bg-black/20 px-3 py-1 border border-white/5 hover:border-white/15 hover:bg-black/30 transition-all cursor-default" title="Simulation Sequence — cycling through pre-built crisis scenarios">
<span className="text-[9px] font-mono text-[#b5a642]">SEQ: {String(demoinfo.currentindex+1).padStart(2,'0')}/{String(demoinfo.poolsize).padStart(2,'0')}</span>
<div className="w-20 h-[2px] bg-black/60 relative overflow-hidden">
<div className="absolute top-0 left-0 h-full bg-[#b5a642] transition-all duration-300" style={{width:`${((demoinfo.currentindex+1)/demoinfo.poolsize)*100}%`}}/>
</div>
</div>
)}
</div>
<div className="flex items-center gap-4">
<div className="flex items-center bg-black/30 border border-white/10 text-[10px] font-mono tracking-widest overflow-hidden">
<button onClick={()=>switchmode("demo")} title="Simulation Mode — cycles 55 pre-built crisis headlines offline for safe demo presentations" className={`px-4 py-1.5 transition-all duration-200 ${currentmode==="demo"?'bg-[#b5a642]/20 text-[#b5a642] border-r border-[#b5a642]/30 shadow-[inset_0_0_12px_rgba(181,166,66,0.15)]':'text-gray-600 hover:text-gray-300 hover:bg-white/5 border-r border-white/10'}`}>SIM</button>
<button onClick={()=>switchmode("live")} title="Live Mode — ingests real-time RSS news feeds and parses risk via Gemini LLM" className={`px-4 py-1.5 transition-all duration-200 ${currentmode==="live"?'bg-[#8b0000]/20 text-[#ff4444] shadow-[inset_0_0_12px_rgba(139,0,0,0.25)]':'text-gray-600 hover:text-gray-300 hover:bg-white/5'}`}>LIVE</button>
</div>
<div className="flex items-center gap-2 ml-2 cursor-default" title={connected?"WebSocket connected to backend — real-time data streaming active":"WebSocket disconnected — attempting reconnection every 3 seconds"}>
<div className={`w-1.5 h-1.5 ${connected?'bg-[#b5a642] led-glow-gold':'bg-red-500 led-glow-crimson animate-pulse'}`}/>
<span className={`text-[9px] font-mono tracking-wider pr-4 transition-colors ${connected?'text-gray-400 hover:text-gray-200':'text-red-400 hover:text-red-300'}`}>{connected?"SYS_ONLINE":"SYS_ERROR"}</span>
</div>
</div>
</div>
</motion.header>

<div className="absolute inset-0 z-0 pt-12">
<div className="map-vignette"/>
<div className="map-graticule"/>
<MapContainer center={[20.0,50.0]} zoom={3} minZoom={2.5} maxBounds={[[-90,-180],[90,180]]} maxBoundsViscosity={1.0} style={{width:"100%",height:"100%"}} zoomControl={false} attributionControl={false}>
<Pane name="basemap" style={{ zIndex: 200 }}>
{worldGeo && <GeoJSON data={worldGeo} style={{fillColor:"#1f2937", color:"#374151", weight:1, fillOpacity:1}} />}
{indiaGeo && <GeoJSON data={indiaGeo} style={{fillColor:"#374151", color:"#4b5563", weight:1, opacity: 0.8, fillOpacity:1}} />}
{indiaStatesGeo && <GeoJSON data={indiaStatesGeo} style={{fillColor:"transparent", color:"#9ca3af", weight:1, opacity: 0.3, dashArray:"2,4"}} />}
</Pane>
<MapController flyto={flyto}/>
{(rankedroutes||[]).slice(0,3).map((r,i)=>{
const isselected=i===selectedroute
const baseCoords=r?.coordinates||[]
if(!Array.isArray(baseCoords)||baseCoords.length<2)return null

const coords = baseCoords.map((c, idx) => {
    if (i === 0 || idx === 0 || idx === baseCoords.length - 1) return c;
    const offsetLat = i === 1 ? 0.8 : -0.8;
    const offsetLng = i === 1 ? -0.8 : 0.8;
    return [c[0] + offsetLat, c[1] + offsetLng]; 
});

return(
<Polyline className={`animated-route-${i}`} key={i} positions={coords} color={i===0?"#b5a642":i===1?"#06b6d4":i===2?"#ec4899":"#374151"} weight={4} opacity={1} dashArray="6, 12" eventHandlers={{click:()=>{setselectedroute(i);if(coords.length>0)setflyto(coords[0])}}}>
<Tooltip sticky className="!bg-[#131d26] !border-[#b5a642] !text-gray-400 shadow-[4px_4px_0px_rgba(0,0,0,0.8)] rounded-none">
<div className="text-[10px] font-mono p-1">
<p className="font-bold" style={{color:i===0?"#b5a642":i===1?"#06b6d4":i===2?"#ec4899":"#9ca3af"}}>
{i===0?"[OPTIMAL] ":i===1?"[ALT-1] ":i===2?"[ALT-2] ":""}{r?.origin||"--"} → {r?.destination||"--"}
</p>
<p className="text-gray-400 mt-1">Cost: ${(r?.totalcost||0).toFixed(0)} | {r?.transitdays||0}d | {r?.distancenm||0}nm</p>
<p className="text-gray-500">Country: {r?.origincountry||"--"} | Corridor: {r?.origincorridor||"--"}</p>
{r?.chokepoints&&r.chokepoints.length>0&&<p className="text-[#8b0000] mt-1">Chokepoints: {r.chokepoints.join(", ")}</p>}
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
<div className="flex items-center gap-2"><div className="w-2 h-0.5 bg-[#b5a642]"/><span className="text-[#b5a642] font-bold">Optimal Route (1st)</span></div>
<div className="flex items-center gap-2"><div className="w-2 h-0.5 bg-[#06b6d4]"/><span className="text-[#06b6d4]">Alternative (2nd)</span></div>
<div className="flex items-center gap-2"><div className="w-2 h-0.5 bg-[#ec4899]"/><span className="text-[#ec4899]">Alternative (3rd)</span></div>
<div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[#b5a642] led-glow-gold"/><span className="text-gray-400">High Risk Chokepoint</span></div>
<div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-blue-500"/><span className="text-gray-400">Refinery</span></div>
<div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-purple-500"/><span className="text-gray-400">SPR</span></div>
<div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-gray-300"/><span className="text-gray-400">Origin Port</span></div>
</div>
</motion.div>
</div>

<motion.div initial={{x:-320,opacity:0}} animate={{x:0,opacity:1}} transition={{ type: "tween", duration: 0.3, ease: "easeOut" }} className="absolute top-12 left-0 bottom-0 w-[300px] z-[1000] glass-panel p-5 overflow-y-auto flex flex-col gap-8 ">
<div>
<div className="flex items-center justify-between mb-3">
<h2 className="text-[10px] font-bold clean-header text-gray-300 tracking-[0.08em]">Corridor Risk Matrix</h2>
<button onClick={()=>setMatrixExpanded(true)} title="Expand Risk Matrix — view detailed corridor intelligence" className="flex items-center gap-1.5 px-2.5 py-1 text-[8px] font-mono tracking-widest uppercase border border-[#b5a642]/40 text-[#b5a642] hover:bg-[#b5a642]/15 hover:border-[#b5a642]/70 transition-all duration-200"><Maximize2 size={10}/>Expand</button>
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
<div className="flex items-center justify-between mb-1">
<span className="text-gray-500 text-[10px] font-semibold uppercase tracking-[0.08em]">Strategic Reserve Capacity</span>
<button onClick={()=>setSprExpanded(true)} title="Expand SPR Analysis — view detailed breakdown and economic impact" className="flex items-center gap-1.5 px-2.5 py-1 text-[8px] font-mono tracking-widest uppercase border border-[#b5a642]/40 text-[#b5a642] hover:bg-[#b5a642]/15 hover:border-[#b5a642]/70 transition-all duration-200"><Maximize2 size={10}/>Expand</button>
</div>
<div className="text-6xl font-bold font-mono leading-none tracking-tighter my-2 transition-colors duration-500" style={{color:drawdown?.status==="Stable"?'#f3f4f6':drawdown?.status==="Critical"?'#b5a642':'#8b0000'}}>{(drawdown?.sprremainingdays ?? (matrixdata?0:9.5)).toFixed(1)}<span className="text-2xl text-gray-600 font-sans tracking-normal ml-1">d</span></div>
<p className="text-[9px] text-gray-500 font-mono uppercase tracking-wider mb-2 leading-relaxed">India's daily crude consumption coverage</p>
<div className="text-[11px] text-white/40 mt-4 flex flex-col gap-1.5 min-w-[200px]">
<div className="flex justify-between"><span>Status:</span> <span className={drawdown?.status==="Stable"?'text-gray-400':drawdown?.status==="Critical"?'text-[#b5a642] font-bold':'text-[#8b0000] font-bold animate-pulse'}>{drawdown?.status||"Stable"}</span></div>
<div className="flex justify-between"><span>Drawdown:</span> <span className="font-mono">{(drawdown?.drawdowndays ?? 0).toFixed(1)}d</span></div>
<div className="flex justify-between"><span>GDP Impact:</span> <span className="font-mono text-[#8b0000]">-${((drawdown?.gdppenalty ?? 0)/1000000000).toFixed(2)}B</span></div>
{drawdown?.status!=="Stable" && rankedroutes?.length>0 && (
<div className="mt-2 pt-2 border-t border-white/5">
<div className="flex justify-between text-[10px]"><span className="text-gray-500">Best Route Transit:</span><span className="font-mono text-[#b5a642]">{rankedroutes[0]?.transitdays ?? 0}d</span></div>
<div className="flex justify-between text-[10px]"><span className="text-gray-500">Via:</span><span className="font-mono text-gray-400">{rankedroutes[0]?.origin||"--"}</span></div>
</div>
)}
</div>
</div>
<div className=" pt-6 pb-2">
<div className="flex items-center justify-between mb-3">
<h2 className="text-[10px] font-bold clean-header text-gray-300 tracking-[0.08em]">Intelligence Feed</h2>
<button onClick={()=>setIntelExpanded(true)} className="flex items-center gap-1.5 px-2.5 py-1 text-[8px] font-mono tracking-widest uppercase border border-white/20 text-gray-400 hover:bg-white/10 transition-all duration-200"><Maximize2 size={10}/>Expand</button>
</div>
<div className="flex flex-col gap-2 relative">
{newsQueue.length>0?newsQueue.map((item,idx)=>{
const sentiment=getNewsSentiment(item)
const colors=getSentimentColor(sentiment)
return(
<div key={idx} className={`p-2 border-l-2 ${colors.border} ${colors.bg}`}>
<p className={`text-[10px] leading-relaxed ${colors.text}`}>{item}</p>
</div>
)
}):(
<p className="text-[11px] text-gray-500 leading-relaxed italic">Awaiting intelligence feed...</p>
)}
</div>
</div>
</motion.div>

<motion.div initial={{y:50,opacity:0}} animate={{y:0,opacity:1}} transition={{ type: "tween", duration: 0.3, ease: "easeOut" }} className="absolute bottom-6 right-6 z-[1000] glass-panel p-4 w-72 rounded-none">
<div className="flex items-center justify-between gap-2 mb-1">
<h2 className="text-[10px] font-bold clean-header text-gray-300 tracking-[0.08em]">Cost Analysis</h2>
<button onClick={()=>setCostExpanded(true)} title="Expand Cost Analysis — view detailed algorithmic breakdown" className="flex items-center gap-1.5 px-2.5 py-1 text-[8px] font-mono tracking-widest uppercase border border-white/20 text-gray-400 hover:bg-white/10 transition-all duration-200"><Maximize2 size={10}/>Expand</button>
</div>
<p className="text-[8px] text-gray-500 font-mono mb-2 uppercase tracking-wider">Comparing risk-weighted penalty scores across the top viable origin ports</p>
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

<motion.div initial={{y:50,opacity:0}} animate={{y:0,opacity:1}} transition={{ type: "tween", duration: 0.3, ease: "easeOut", delay:0.1 }} className="absolute bottom-6 left-[340px] right-[320px] z-[1000] glass-panel p-4 rounded-none max-w-2xl mx-auto flex flex-col max-h-[420px]">
<div className="flex items-center justify-between gap-2 mb-3 shrink-0">
<h2 className="text-[10px] font-bold clean-header text-gray-300 tracking-[0.08em]">Strategic Routing Operations</h2>
<div className="flex items-center gap-3">
<span className="text-[10px] font-mono text-gray-500 bg-white/5 px-2 py-0.5 rounded-none">{(rankedroutes||[]).length} ACTIVE CORRIDORS</span>
<button onClick={()=>setOpsExpanded(true)} title="Expand Routing Strategy — view algorithmic analysis and pathfinding details" className="flex items-center gap-1.5 px-2.5 py-1 text-[8px] font-mono tracking-widest uppercase border border-[#b5a642]/40 text-[#b5a642] hover:bg-[#b5a642]/15 hover:border-[#b5a642]/70 transition-all duration-200"><Maximize2 size={10}/>Expand</button>
</div>
</div>
<div className="mb-4 p-3 border-l-2 border-[#b5a642] bg-white/5 rounded-none shrink-0">
<div className="flex items-center gap-2 mb-1"><div className="w-1.5 h-1.5 bg-[#b5a642] rounded-none animate-pulse led-glow-gold"></div><span className="text-[9px] font-bold tracking-[0.12em] text-[#b5a642] uppercase">Live Intelligence Integration</span></div>
<p className="text-[11px] text-gray-200 leading-relaxed font-sans">{typedreport||"Awaiting routing directive..."}<span className="animate-pulse text-[#b5a642] ml-0.5">|</span></p>
</div>
<div className="flex flex-col gap-1 overflow-y-auto pr-2 flex-1">
<div className="text-[8.5px] text-gray-500 font-mono mb-2 border-b border-white/5 pb-2 uppercase tracking-wide">
<strong className="text-gray-400">Algorithm:</strong> Risk Score = Base Distance (nm) × (1 + Geopolitical Threat Multiplier). Lower is better.
</div>
<div className="grid grid-cols-[16px_1fr_40px_50px_50px] gap-3 text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1 pb-1 ">
<span>#</span><span>Origin → Destination</span><span className="text-right">Days</span><span className="text-right" title="Algorithmic penalty score based on live risk">Score</span><span className="text-right">Dist</span>
</div>
{(rankedroutes||[]).slice(0,5).map((r,i)=>{
const maxcost=(rankedroutes||[]).length>0?(rankedroutes[rankedroutes.length-1]?.totalcost||1):1
return(
<motion.div key={i} initial={{x:-15,opacity:0}} animate={{x:0,opacity:1}} transition={{ type: "tween", duration: 0.2, ease: "linear" }} onClick={()=>{setselectedroute(i);const coords=r?.coordinates;if(Array.isArray(coords)&&coords.length>0)setflyto(coords[0])}} className={`grid grid-cols-[16px_1fr_40px_50px_50px] gap-3 items-center p-1.5 rounded-none cursor-pointer transition-all text-[11px] ${i===selectedroute?'bg-[#b5a642]/10 border-l border-[#b5a642]':'hover:bg-white/5 border-l border-transparent'}`}>
<span className={`font-bold ${i===selectedroute?'text-[#b5a642]':'text-gray-600'}`}>{i+1}</span>
<div className="min-w-0">
<p className={`font-medium truncate ${i===selectedroute?'text-gray-200':'text-gray-400'}`}>{r?.origin||"--"} → {r?.destination||"--"}</p>
<div className="h-0.5 bg-gray-800 rounded-none overflow-hidden mt-1">
<div className="h-full rounded-none transition-all duration-700" style={{width:`${Math.max(5,100-((r?.totalcost ?? 0)/maxcost)*80)}%`,background:i===0?'#b5a642':'#374151'}}/>
</div>
</div>
<span className="font-mono text-gray-400 text-right">{r?.transitdays ?? 0}d</span>
<span className="font-mono text-gray-400 text-right">{(r?.totalcost ?? 0).toFixed(0)}</span>
<span className="font-mono text-gray-500 text-right">{r?.distancenm ?? 0}nm</span>
</motion.div>
)})}
</div>
</motion.div>

<AnimatePresence>
{matrixExpanded && (
<motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:0.2}} className="fixed inset-0 z-[5000] flex items-center justify-center" onClick={()=>{setMatrixExpanded(false);setExpandedCorridor(null)}}>
<div className="absolute inset-0 bg-black/80 backdrop-blur-sm"/>
<motion.div initial={{scale:0.9,opacity:0,y:20}} animate={{scale:1,opacity:1,y:0}} exit={{scale:0.95,opacity:0,y:10}} transition={{type:"tween",duration:0.25,ease:"easeOut"}} onClick={e=>e.stopPropagation()} className="relative w-[700px] max-h-[85vh] glass-panel border border-white/10 overflow-hidden flex flex-col">
<div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
<div>
<h2 className="text-[13px] font-bold tracking-[0.15em] text-gray-200 uppercase">Corridor Risk Matrix</h2>
<p className="text-[10px] text-gray-500 font-mono mt-1">Real-time geopolitical risk assessment across {riskcorridors.length} maritime corridors</p>
</div>
<button onClick={()=>{setMatrixExpanded(false);setExpandedCorridor(null)}} className="text-gray-500 hover:text-white transition-colors p-2 hover:bg-white/10"><X size={16}/></button>
</div>
<div className="overflow-y-auto flex-1 px-6 py-4">
<div className="flex flex-col gap-1">
{riskcorridors.map((c)=>{
const risk=corridorrisks?.[c.key]||0
const corridorNews=getCorridorNews(c.key)
const isOpen=expandedCorridor===c.key
return(
<div key={c.key}>
<div onClick={()=>setExpandedCorridor(isOpen?null:c.key)} className={`flex items-center justify-between p-3 cursor-pointer transition-all duration-200 ${isOpen?'bg-white/5 border-l-2':'hover:bg-white/[0.03] border-l-2 border-transparent'}`} style={isOpen?{borderLeftColor:getRiskColor(risk)}:{}}>
<div className="flex items-center gap-3 flex-1">
<span className="text-[12px] font-semibold text-gray-200 w-24">{c.name}</span>
<div className="flex-1 h-2 bg-gray-800/80 rounded-none overflow-hidden max-w-[200px]">
<motion.div initial={{width:0}} animate={{width:`${risk*100}%`}} transition={{type:"tween",duration:0.4,ease:"easeOut"}} className="h-full rounded-none" style={{background:getRiskColor(risk)}}/>
</div>
<span className="font-mono text-[12px] w-12 text-right font-bold" style={{color:getRiskColor(risk)}}>{(risk*100).toFixed(0)}%</span>
</div>
<div className="flex items-center gap-3 ml-4">
{corridorNews.length>0 && <span className="text-[9px] font-mono text-gray-500 bg-white/5 px-2 py-0.5">{corridorNews.length} intel</span>}
{isOpen?<ChevronUp size={14} className="text-gray-500"/>:<ChevronDown size={14} className="text-gray-500"/>}
</div>
</div>
<AnimatePresence>
{isOpen && corridorNews.length>0 && (
<motion.div initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}} exit={{height:0,opacity:0}} transition={{duration:0.2}} className="overflow-hidden">
<div className="pl-6 pr-3 pb-3 flex flex-col gap-1.5">
{corridorNews.map((news,idx)=>{
const sentiment=getNewsSentiment(news)
const colors=getSentimentColor(sentiment)
return(
<div key={idx} className={`flex items-start gap-2.5 p-2.5 ${colors.bg} border-l-2 ${colors.border} transition-all`}>
<div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${colors.dot}`}/>
<div className="flex-1 min-w-0">
<p className={`text-[11px] leading-relaxed ${colors.text}`}>{news}</p>
<span className="text-[8px] font-mono text-gray-600 uppercase tracking-widest mt-1 block">{sentiment}</span>
</div>
</div>
)
})}
</div>
</motion.div>
)}
{isOpen && corridorNews.length===0 && (
<motion.div initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}} exit={{height:0,opacity:0}} transition={{duration:0.2}} className="overflow-hidden">
<div className="pl-6 pr-3 pb-3">
<p className="text-[11px] text-gray-600 italic">No intelligence reports for this corridor yet.</p>
</div>
</motion.div>
)}
</AnimatePresence>
</div>
)
})}
</div>
</div>
<div className="px-6 py-3 border-t border-white/5 flex items-center justify-between text-[9px] font-mono text-gray-600">
<span>Total intelligence items: {newsQueue.length}</span>
<span>Click any corridor to view related intelligence</span>
</div>
</motion.div>
</motion.div>
)}
</AnimatePresence>
<AnimatePresence>
{sprExpanded && (
<motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:0.2}} className="fixed inset-0 z-[5000] flex items-center justify-center" onClick={()=>setSprExpanded(false)}>
<div className="absolute inset-0 bg-black/80 backdrop-blur-sm"/>
<motion.div initial={{scale:0.9,opacity:0,y:20}} animate={{scale:1,opacity:1,y:0}} exit={{scale:0.95,opacity:0,y:10}} transition={{type:"tween",duration:0.25,ease:"easeOut"}} onClick={e=>e.stopPropagation()} className="relative w-[650px] max-h-[85vh] glass-panel border border-white/10 overflow-hidden flex flex-col">
<div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
<div>
<h2 className="text-[13px] font-bold tracking-[0.15em] text-gray-200 uppercase">Strategic Reserve Analysis</h2>
<p className="text-[10px] text-gray-500 font-mono mt-1">India's Strategic Petroleum Reserve drawdown simulation</p>
</div>
<button onClick={()=>setSprExpanded(false)} className="text-gray-500 hover:text-white transition-colors p-2 hover:bg-white/10"><X size={16}/></button>
</div>
<div className="overflow-y-auto flex-1 px-6 py-5">
<div className="flex items-end gap-6 mb-6">
<div>
<span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">Remaining Coverage</span>
<div className="text-5xl font-bold font-mono mt-1 transition-colors" style={{color:drawdown?.status==="Stable"?'#f3f4f6':drawdown?.status==="Critical"?'#b5a642':'#8b0000'}}>{(drawdown?.sprremainingdays ?? (matrixdata?0:9.5)).toFixed(1)}<span className="text-xl text-gray-600 ml-1">days</span></div>
</div>
<div className={`px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-widest mb-2 ${drawdown?.status==="Stable"?'bg-gray-800 text-gray-400':drawdown?.status==="Critical"?'bg-[#b5a642]/20 text-[#b5a642] border border-[#b5a642]/30':'bg-[#8b0000]/20 text-[#ff4444] border border-[#8b0000]/30 animate-pulse'}`}>{drawdown?.status||"Stable"}</div>
</div>
<div className="w-full h-3 bg-gray-800 overflow-hidden mb-6">
<motion.div initial={{width:0}} animate={{width:`${((drawdown?.sprremainingdays ?? (matrixdata?0:9.5))/9.5)*100}%`}} transition={{duration:0.8,ease:"easeOut"}} className="h-full transition-colors" style={{background:drawdown?.status==="Stable"?'#4b5563':drawdown?.status==="Critical"?'#b5a642':'#8b0000'}}/>
</div>
<div className="grid grid-cols-2 gap-4 mb-6">
<div className="p-3 bg-white/[0.03] border border-white/5">
<span className="text-[9px] font-mono text-gray-500 uppercase tracking-wider">Drawdown Period</span>
<p className="text-lg font-mono font-bold text-gray-200 mt-1">{(drawdown?.drawdowndays ?? 0).toFixed(1)} <span className="text-sm text-gray-500">days</span></p>
<p className="text-[10px] text-gray-600 mt-1">Duration the SPR is being tapped to cover supply shortfall</p>
</div>
<div className="p-3 bg-white/[0.03] border border-white/5">
<span className="text-[9px] font-mono text-gray-500 uppercase tracking-wider">GDP Penalty</span>
<p className="text-lg font-mono font-bold text-[#8b0000] mt-1">-${((drawdown?.gdppenalty ?? 0)/1000000000).toFixed(2)}B</p>
<p className="text-[10px] text-gray-600 mt-1">Economic cost from rerouted supply chains at ${sprmetadata?.gdpimpactperbarrel ?? 85}/barrel</p>
</div>
<div className="p-3 bg-white/[0.03] border border-white/5">
<span className="text-[9px] font-mono text-gray-500 uppercase tracking-wider">Deficit Barrels</span>
<p className="text-lg font-mono font-bold text-gray-200 mt-1">{((drawdown?.deficitbarrels ?? 0)/1000000).toFixed(1)}M</p>
<p className="text-[10px] text-gray-600 mt-1">Total barrels drawn from strategic reserves</p>
</div>
<div className="p-3 bg-white/[0.03] border border-white/5">
<span className="text-[9px] font-mono text-gray-500 uppercase tracking-wider">National Consumption</span>
<p className="text-lg font-mono font-bold text-gray-200 mt-1">{((sprmetadata?.nationalconsumptionbpd ?? 5000000)/1000000).toFixed(1)}M <span className="text-sm text-gray-500">BPD</span></p>
<p className="text-[10px] text-gray-600 mt-1">India's daily crude consumption rate</p>
</div>
</div>
<div className="border-t border-white/5 pt-4">
<h3 className="text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400 mb-3">Why This Calculation?</h3>
{drawdown?.status==="Stable" ? (
<div className="p-3 bg-emerald-500/5 border-l-2 border-emerald-500/30">
<p className="text-[11px] text-emerald-400 leading-relaxed">The optimal shipping route ({rankedroutes?.[0]?.origin||"--"} → {rankedroutes?.[0]?.destination||"--"}) has a transit time of {rankedroutes?.[0]?.transitdays||0}d, which is within the safe threshold of 4 days. No strategic reserve drawdown is required.</p>
</div>
) : (
<div className="flex flex-col gap-2">
<div className="p-3 bg-red-500/5 border-l-2 border-red-500/30">
<p className="text-[11px] text-red-400 leading-relaxed">The best available route ({rankedroutes?.[0]?.origin||"--"} → {rankedroutes?.[0]?.destination||"--"}) now requires {rankedroutes?.[0]?.transitdays||0}d transit, exceeding the 4-day safe threshold by {((rankedroutes?.[0]?.transitdays||0)-4).toFixed(1)}d. The SPR must cover {(drawdown?.drawdowndays||0).toFixed(1)} days of national consumption.</p>
</div>
{rankedroutes?.[0]?.chokepoints?.length>0 && (
<div className="p-3 bg-[#b5a642]/5 border-l-2 border-[#b5a642]/30">
<p className="text-[11px] text-[#b5a642] leading-relaxed">Route passes through elevated-risk chokepoints: {rankedroutes[0].chokepoints.join(", ")}. These chokepoints are contributing to longer transit times due to rerouting around danger zones.</p>
</div>
)}
{newsQueue.length>0 && (
<div className="p-3 bg-white/[0.03] border-l-2 border-white/10">
<p className="text-[10px] text-gray-500 uppercase tracking-wider font-mono mb-2">Latest Intelligence Driving This Assessment</p>
<p className="text-[11px] text-gray-400 leading-relaxed">{newsQueue[0]}</p>
</div>
)}
</div>
)}
</div>
</div>
<div className="px-6 py-3 border-t border-white/5 flex items-center justify-between text-[9px] font-mono text-gray-600">
<span>Base coverage: {sprmetadata?.coveragedays||9.5} days</span>
<span>Threshold: 4d transit | Impact: ${sprmetadata?.gdpimpactperbarrel||85}/bbl</span>
</div>
</motion.div>
</motion.div>
)}
</AnimatePresence>
<AnimatePresence>
{intelExpanded && (
<motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:0.2}} className="fixed inset-0 z-[5000] flex items-center justify-center" onClick={()=>setIntelExpanded(false)}>
<div className="absolute inset-0 bg-black/80 backdrop-blur-sm"/>
<motion.div initial={{scale:0.9,opacity:0,y:20}} animate={{scale:1,opacity:1,y:0}} exit={{scale:0.95,opacity:0,y:10}} transition={{type:"tween",duration:0.25,ease:"easeOut"}} onClick={e=>e.stopPropagation()} className="relative w-[700px] max-h-[85vh] glass-panel border border-white/10 overflow-hidden flex flex-col">
<div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
<div>
<h2 className="text-[13px] font-bold tracking-[0.15em] text-gray-200 uppercase">Live Intelligence Log</h2>
<p className="text-[10px] text-gray-500 font-mono mt-1">Real-time global geopolitical and supply chain events</p>
</div>
<button onClick={()=>setIntelExpanded(false)} className="text-gray-500 hover:text-white transition-colors p-2 hover:bg-white/10"><X size={16}/></button>
</div>
<div className="overflow-y-auto flex-1 px-6 py-4 flex flex-col gap-2">
{newsQueue.length===0 && <p className="text-[11px] text-gray-500 italic p-4 text-center">No intelligence received yet.</p>}
{newsQueue.map((news,idx)=>{
const sentiment=getNewsSentiment(news)
const colors=getSentimentColor(sentiment)
return(
<div key={idx} className={`flex items-start gap-3 p-3 ${colors.bg} border-l-2 ${colors.border}`}>
<div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${colors.dot}`}/>
<div className="flex-1">
<p className={`text-[12px] leading-relaxed ${colors.text}`}>{news}</p>
<span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest mt-2 block opacity-70">
Event {newsQueue.length-idx} | Severity: {sentiment}
</span>
</div>
</div>
)
})}
</div>
</motion.div>
</motion.div>
)}
</AnimatePresence>

<AnimatePresence>
{opsExpanded && (
<motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:0.2}} className="fixed inset-0 z-[5000] flex items-center justify-center" onClick={()=>setOpsExpanded(false)}>
<div className="absolute inset-0 bg-black/80 backdrop-blur-sm"/>
<motion.div initial={{scale:0.9,opacity:0,y:20}} animate={{scale:1,opacity:1,y:0}} exit={{scale:0.95,opacity:0,y:10}} transition={{type:"tween",duration:0.25,ease:"easeOut"}} onClick={e=>e.stopPropagation()} className="relative w-[800px] max-h-[85vh] glass-panel border border-[#b5a642]/30 overflow-hidden flex flex-col">
<div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
<div>
<h2 className="text-[13px] font-bold tracking-[0.15em] text-[#b5a642] uppercase">Optimal Routing Strategy</h2>
<p className="text-[10px] text-gray-500 font-mono mt-1">Dijkstra algorithm pathfinding analysis with geopolitical risk weightings</p>
</div>
<button onClick={()=>setOpsExpanded(false)} className="text-gray-500 hover:text-white transition-colors p-2 hover:bg-white/10"><X size={16}/></button>
</div>
<div className="overflow-y-auto flex-1 px-6 py-5">
<div className="mb-6 p-4 bg-white/[0.03] border border-white/10">
<p className="text-[11px] text-gray-300 leading-relaxed">
<strong className="text-[#b5a642]">How this works:</strong> The routing engine uses Dijkstra's algorithm to analyze the global maritime network in real-time. It evaluates thousands of possible permutations to find alternative origin ports and supply corridors. By dynamically inflating the distance penalty of corridors experiencing high geopolitical risk (as determined by the Live Intelligence integration), the engine automatically calculates the fastest, safest, and most cost-effective strategic detours to ensure India's energy security.
</p>
</div>
<div className="flex flex-col gap-4">

{/* Route 1: Optimal */}
{rankedroutes?.length>0 && (
<div className="p-4 bg-[#b5a642]/10 border-l-4 border-[#b5a642]">
<div className="flex items-center justify-between mb-2">
<h3 className="text-[12px] font-bold text-[#b5a642] tracking-widest uppercase">1st: Optimal Strategy</h3>
<span className="font-mono text-[11px] text-[#b5a642]">${(rankedroutes[0].totalcost||0).toFixed(0)}</span>
</div>
<p className="text-[13px] font-medium text-gray-200 mb-2">{rankedroutes[0].origin} → {rankedroutes[0].destination}</p>
<div className="flex items-center gap-4 text-[10px] font-mono text-gray-400 mb-3">
<span>Transit: {rankedroutes[0].transitdays}d</span>
<span>Distance: {rankedroutes[0].distancenm}nm</span>
</div>
<div className="p-3 bg-black/30 border border-[#b5a642]/20">
<p className="text-[11px] text-gray-300 leading-relaxed">
<strong className="text-[#b5a642]">Why this route?</strong> This path represents the absolute lowest weighted cost across the entire global maritime network. It successfully balances base transit distance with current geopolitical risk multipliers.
</p>
</div>
</div>
)}

{/* Route 2: Alternative 1 */}
{rankedroutes?.length>1 && (
<div className="p-4 bg-[#06b6d4]/10 border-l-4 border-[#06b6d4]">
<div className="flex items-center justify-between mb-2">
<h3 className="text-[12px] font-bold text-[#06b6d4] tracking-widest uppercase">2nd: Primary Alternative</h3>
<span className="font-mono text-[11px] text-[#06b6d4]">${(rankedroutes[1].totalcost||0).toFixed(0)}</span>
</div>
<p className="text-[13px] font-medium text-gray-200 mb-2">{rankedroutes[1].origin} → {rankedroutes[1].destination}</p>
<div className="flex items-center gap-4 text-[10px] font-mono text-gray-400 mb-3">
<span>Transit: {rankedroutes[1].transitdays}d</span>
<span>Distance: {rankedroutes[1].distancenm}nm</span>
</div>
<div className="p-3 bg-black/30 border border-[#06b6d4]/20">
<p className="text-[11px] text-gray-300 leading-relaxed">
<strong className="text-[#06b6d4]">Why this route?</strong> This is the next best contingency if the primary route becomes unavailable. It typically shifts to a different origin port or a different destination refinery to avoid localized congestion or specific corridor risks.
</p>
</div>
</div>
)}

{/* Route 3: Alternative 2 */}
{rankedroutes?.length>2 && (
<div className="p-4 bg-[#ec4899]/10 border-l-4 border-[#ec4899]">
<div className="flex items-center justify-between mb-2">
<h3 className="text-[12px] font-bold text-[#ec4899] tracking-widest uppercase">3rd: Secondary Alternative</h3>
<span className="font-mono text-[11px] text-[#ec4899]">${(rankedroutes[2].totalcost||0).toFixed(0)}</span>
</div>
<p className="text-[13px] font-medium text-gray-200 mb-2">{rankedroutes[2].origin} → {rankedroutes[2].destination}</p>
<div className="flex items-center gap-4 text-[10px] font-mono text-gray-400 mb-3">
<span>Transit: {rankedroutes[2].transitdays}d</span>
<span>Distance: {rankedroutes[2].distancenm}nm</span>
</div>
<div className="p-3 bg-black/30 border border-[#ec4899]/20">
<p className="text-[11px] text-gray-300 leading-relaxed">
<strong className="text-[#ec4899]">Why this route?</strong> A deep fallback option. Often utilizes slightly less efficient refineries or longer corridors, but provides critical supply chain redundancy during severe multi-corridor crises.
</p>
</div>
</div>
)}

</div>
</div>
</motion.div>
</motion.div>
)}
</AnimatePresence>

<AnimatePresence>
{costExpanded && (
<motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:0.2}} className="fixed inset-0 z-[5000] flex items-center justify-center" onClick={()=>setCostExpanded(false)}>
<div className="absolute inset-0 bg-black/80 backdrop-blur-sm"/>
<motion.div initial={{scale:0.9,opacity:0,y:20}} animate={{scale:1,opacity:1,y:0}} exit={{scale:0.95,opacity:0,y:10}} transition={{type:"tween",duration:0.25,ease:"easeOut"}} onClick={e=>e.stopPropagation()} className="relative w-[800px] max-h-[85vh] glass-panel border border-white/10 overflow-hidden flex flex-col">
<div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
<div>
<h2 className="text-[13px] font-bold tracking-[0.15em] text-gray-200 uppercase">Cost Analysis & Algorithmic Scoring</h2>
<p className="text-[10px] text-gray-500 font-mono mt-1">Detailed breakdown of Risk Penalty Multipliers across origin ports</p>
</div>
<button onClick={()=>setCostExpanded(false)} className="text-gray-500 hover:text-white transition-colors p-2 hover:bg-white/10"><X size={16}/></button>
</div>
<div className="overflow-y-auto flex-1 px-6 py-5">
<div className="mb-6 p-4 bg-white/[0.03] border border-white/10">
<p className="text-[11px] text-gray-300 leading-relaxed mb-3">
<strong className="text-white">What is this telling us?</strong> The Cost Analysis compares the mathematical "viability" of the top available origin ports. It calculates how heavily compromised a corridor is, and inflates the "cost" of traveling that corridor accordingly.
</p>
<p className="text-[11px] text-gray-300 leading-relaxed mb-3">
<strong className="text-white">How is it calculated?</strong> The engine calculates the base distance from the origin to the destination in nautical miles. It then looks up the geopolitical risk multiplier for the corridors on that path (from 0% to 100%). The formula is:<br/>
<span className="font-mono text-[#b5a642] block mt-2 text-center text-[12px] bg-black/40 py-2 border border-white/5">Risk Score = Base Distance × (1 + Threat Multiplier)</span>
</p>
<p className="text-[11px] text-gray-300 leading-relaxed">
If a port requires passing through a high-risk chokepoint like the Strait of Hormuz (98% threat), its effective distance (and therefore Risk Score) nearly doubles. The routing engine automatically favors ports with the lowest Risk Scores.
</p>
</div>
<div className="h-64 w-full bg-black/20 p-4 border border-white/5">
<ResponsiveContainer width="100%" height="100%">
<BarChart data={routecostdata} barSize={24}>
<CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false}/>
<XAxis dataKey="name" tick={{fontSize:10,fill:"#6b7280"}} axisLine={false} tickLine={false}/>
<YAxis tick={{fontSize:10,fill:'#6b7280',fontFamily:'JetBrains Mono'}} axisLine={false} tickLine={false} width={40}/>
<RechartsTooltip cursor={{fill:'#ffffff05'}} contentStyle={{backgroundColor:'#0f1722',borderColor:'#ffffff10',fontFamily:'JetBrains Mono',fontSize:'10px'}} itemStyle={{color:'#b5a642'}}/>
<Bar dataKey="cost" radius={[2,2,0,0]}>
{routecostdata.map((entry,i)=>(<Cell key={i} fill={i===0?'url(#goldGradientExpanded)':'#374151'}/>))}
</Bar>
<defs>
<linearGradient id="goldGradientExpanded" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#b5a642"/><stop offset="100%" stopColor="#7c722e"/></linearGradient>
</defs>
</BarChart>
</ResponsiveContainer>
</div>
</div>
</motion.div>
</motion.div>
)}
</AnimatePresence>

</div>
</ErrorBoundary>
)
}