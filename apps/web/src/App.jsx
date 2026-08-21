import React from 'react'
import { useState } from 'react'
import { useEffect } from 'react'
import { useRef } from 'react'
import { useCallback } from 'react'
import { MapContainer } from 'react-leaflet'
import { TileLayer } from 'react-leaflet'
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
if(this.state.haserror){return<div className="flex items-center justify-center h-full bg-gray-950 text-red-400 text-sm font-mono">System recovery in progress...</div>}
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
const socketref=useRef(null)
const reportref=useRef("")
const typetimerref=useRef(null)
useEffect(()=>{
let reconnecttimer=null
const connectws=()=>{
const issecure=window.location.protocol==="https:"
const protocol=issecure?"wss://":"ws://"
const host=import.meta.env.VITE_WS_HOST||(window.location.hostname+":8000")
const wsurl=protocol+host+"/ws"
const socket=new WebSocket(wsurl)
socketref.current=socket
socket.onopen=()=>{
setconnected(true)
socket.send(JSON.stringify({mode:"demo"}))
}
socket.onmessage=(event)=>{
try{
const data=JSON.parse(event.data)
setmatrixdata(data)
if(data.report&&data.report!==reportref.current){
reportref.current=data.report
settypedreport("")
if(typetimerref.current)clearInterval(typetimerref.current)
let i=0
typetimerref.current=setInterval(()=>{
if(i<data.report.length){
settypedreport(prev=>prev+data.report.charAt(i))
i++
}else{
clearInterval(typetimerref.current)
}
},15)
}
}catch(e){console.error(e)}
}
socket.onclose=()=>{
setconnected(false)
reconnecttimer=setTimeout(connectws,3000)
}
socket.onerror=()=>{setconnected(false)}
}
connectws()
return()=>{
if(socketref.current)socketref.current.close()
if(typetimerref.current)clearInterval(typetimerref.current)
if(reconnecttimer)clearTimeout(reconnecttimer)
}
},[])
const switchmode=useCallback((mode)=>{
setcurrentmode(mode)
setselectedroute(0)
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
{name:"Hormuz",key:"hormuz",color:"#ef4444"},
{name:"Red Sea",key:"redsea",color:"#f97316"},
{name:"Suez",key:"suez",color:"#eab308"},
{name:"Malacca",key:"malacca",color:"#06b6d4"},
{name:"W.Africa",key:"westafrica",color:"#8b5cf6"},
{name:"Americas",key:"americas",color:"#ec4899"},
{name:"US Gulf",key:"usgulf",color:"#f43f5e"},
{name:"Pacific",key:"pacific",color:"#14b8a6"},
{name:"Cape",key:"cape",color:"#22c55e"}
]
const sprtimelinedata=[
{day:"Normal",spr:sprmetadata?.coveragedays||9.5},
{day:"Current",spr:drawdown?.sprremainingdays||9.5},
{day:"Projected",spr:Math.max(0,(drawdown?.sprremainingdays||9.5)-2)}
]
const routecostdata=(rankedroutes||[]).slice(0,6).map((r)=>({
name:(r?.origin||"Rt").substring(0,8),
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
<div className="flex flex-col h-screen w-screen bg-gray-950 text-white overflow-hidden">
<motion.header initial={{y:-50,opacity:0}} animate={{y:0,opacity:1}} transition={{duration:0.5}} className="h-11 glass flex items-center justify-between px-4 z-[2000] border-b border-gray-800 shrink-0">
<div className="flex items-center gap-3">
<ShieldAlert className="text-emerald-500 w-5 h-5"/>
<span className="text-sm font-bold tracking-[0.15em] text-gray-200">INDIA ENERGY COMMAND</span>
</div>
<div className="flex items-center gap-4">
<div className="flex items-center gap-1 text-[9px] font-mono text-gray-500">
<Globe className="w-3 h-3"/>
<span>{gridstats?.refineries||0}R</span>
<span>{gridstats?.originports||0}P</span>
<span>{gridstats?.chokepoints||0}C</span>
<span>{gridstats?.edges||0}E</span>
</div>
<div className="flex gap-1">
<button onClick={()=>switchmode("demo")} title="DEMO MODE: Cycles through 55 simulated crisis headlines every 6 seconds for 5 minutes. Uses offline keyword parsing — zero API calls. Perfect for presentations." className={`text-[9px] font-mono px-2 py-0.5 rounded flex items-center gap-1 transition-all ${currentmode==="demo"?'bg-emerald-900/50 text-emerald-400 border border-emerald-700':'bg-gray-800/50 text-gray-500 border border-gray-700 hover:text-gray-300'}`}>
<Play className="w-2.5 h-2.5"/>DEMO
</button>
<button onClick={()=>switchmode("live")} title="LIVE MODE: Connects to real-time Google News RSS feeds and Gemini AI for live geopolitical risk extraction. Uses API quota — hash-gated to prevent exhaustion." className={`text-[9px] font-mono px-2 py-0.5 rounded flex items-center gap-1 transition-all ${currentmode==="live"?'bg-red-900/50 text-red-400 border border-red-700':'bg-gray-800/50 text-gray-500 border border-gray-700 hover:text-gray-300'}`}>
<Wifi className="w-2.5 h-2.5"/>LIVE
</button>
</div>
<div className="flex items-center gap-1.5">
<div className={`w-2 h-2 rounded-full ${connected?'bg-emerald-500 animate-pulse':'bg-red-500'}`}/>
<span className="text-[9px] font-mono text-gray-400">{connected?"CONNECTED":"OFFLINE"}</span>
</div>
</div>
</motion.header>
{currentmode==="demo"&&demoinfo?.poolsize>0&&(
<div className="h-5 bg-emerald-950/30 border-b border-emerald-900/30 flex items-center px-4 gap-2 shrink-0">
<Radio className="w-3 h-3 text-emerald-500 animate-pulse"/>
<span className="text-[9px] font-mono text-emerald-400">DEMO SIMULATION ACTIVE</span>
<span className="text-[9px] font-mono text-gray-500">Headline {(demoinfo?.currentindex||0)+1}/{demoinfo?.poolsize||0}</span>
<div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden ml-2">
<div className="h-full bg-emerald-600 rounded-full transition-all duration-500" style={{width:`${(((demoinfo?.currentindex||0)+1)/(demoinfo?.poolsize||1))*100}%`}}/>
</div>
</div>
)}
<div className="flex flex-1 overflow-hidden min-h-0">
<motion.div initial={{x:-280,opacity:0}} animate={{x:0,opacity:1}} transition={{duration:0.6,delay:0.1}} className="w-64 h-full flex flex-col gap-2.5 p-2.5 z-[1000] glass border-r border-gray-800 overflow-y-auto shrink-0">
<div>
<div className="flex items-center gap-2 mb-1.5">
<AlertTriangle className="w-3 h-3 text-red-500"/>
<h2 className="text-[9px] font-bold tracking-[0.12em] text-gray-400 uppercase">Corridor Risk Matrix</h2>
</div>
<div className="flex flex-col gap-1">
{riskcorridors.map((c,i)=>{
const risk=corridorrisks?.[c.key]||0
return(
<motion.div key={c.key} initial={{x:-15,opacity:0}} animate={{x:0,opacity:1}} transition={{delay:0.05*i,duration:0.3}} className={`p-1.5 rounded text-[10px] ${getthreatclass(risk)} flex items-center justify-between`}>
<span className="font-medium">{c.name}</span>
<div className="flex items-center gap-1.5">
<div className="w-12 h-1 bg-gray-800 rounded-full overflow-hidden">
<motion.div initial={{width:0}} animate={{width:`${risk*100}%`}} transition={{duration:0.8,delay:0.08*i}} className="h-full rounded-full" style={{background:c.color}}/>
</div>
<span className="font-mono w-7 text-right text-[9px]" style={{color:c.color}}>{(risk*100).toFixed(0)}%</span>
</div>
</motion.div>
)})}
</div>
</div>
<div className="border-t border-gray-800 pt-2.5">
<div className="flex items-center gap-2 mb-1.5">
<Droplet className="w-3 h-3 text-purple-400"/>
<h2 className="text-[9px] font-bold tracking-[0.12em] text-gray-400 uppercase">SPR Reserve Status</h2>
</div>
<div className="grid grid-cols-2 gap-1.5">
<div className="bg-black/40 p-1.5 rounded border border-gray-800">
<p className="text-[8px] text-gray-500 uppercase">Remaining</p>
<p className="text-base text-purple-400 font-mono">{(drawdown?.sprremainingdays||0).toFixed(1)}d</p>
</div>
<div className="bg-black/40 p-1.5 rounded border border-gray-800">
<p className="text-[8px] text-gray-500 uppercase">Status</p>
<p className={`text-xs font-bold ${drawdown?.status==="Stable"?'text-emerald-400':drawdown?.status==="Critical"?'text-red-400':'text-orange-400'}`}>{drawdown?.status||"--"}</p>
</div>
<div className="bg-black/40 p-1.5 rounded border border-gray-800">
<p className="text-[8px] text-gray-500 uppercase">GDP Impact</p>
<p className="text-xs text-red-400 font-mono">-${((drawdown?.gdppenalty||0)/1000000000).toFixed(2)}B</p>
</div>
<div className="bg-black/40 p-1.5 rounded border border-gray-800">
<p className="text-[8px] text-gray-500 uppercase">Deficit</p>
<p className="text-xs text-orange-400 font-mono">{((drawdown?.deficitbarrels||0)/1000000).toFixed(1)}M</p>
</div>
</div>
<div className="h-16 w-full mt-1.5">
<ResponsiveContainer width="100%" height="100%">
<AreaChart data={sprtimelinedata}>
<defs><linearGradient id="sprgradient" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#7c3aed" stopOpacity={0.4}/><stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/></linearGradient></defs>
<XAxis dataKey="day" tick={{fontSize:8,fill:'#6b7280'}} axisLine={false} tickLine={false}/>
<YAxis domain={[0,10]} hide/>
<Area type="monotone" dataKey="spr" stroke="#a855f7" fill="url(#sprgradient)" strokeWidth={2}/>
</AreaChart>
</ResponsiveContainer>
</div>
</div>
<div className="border-t border-gray-800 pt-2.5">
<div className="flex items-center gap-2 mb-1.5">
<Activity className="w-3 h-3 text-emerald-400"/>
<h2 className="text-[9px] font-bold tracking-[0.12em] text-gray-400 uppercase">Intelligence Feed</h2>
</div>
<div className="p-2 bg-black/40 rounded border border-gray-800 max-h-24 overflow-y-auto">
<p className="text-[10px] text-gray-300 leading-relaxed">{matrixdata?.news||"Awaiting intelligence feed..."}</p>
</div>
</div>
</motion.div>
<div className="flex-1 h-full flex flex-col min-w-0">
<div className="flex-1 relative min-h-0">
<MapContainer center={[20.0,50.0]} zoom={3} style={{width:"100%",height:"100%"}} zoomControl={false} attributionControl={false}>
<TileLayer url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"/>
<MapController flyto={flyto}/>
{(rankedroutes||[]).slice(0,10).map((r,i)=>{
const isselected=i===selectedroute
const coords=r?.coordinates||[]
if(!Array.isArray(coords)||coords.length<2)return null
return(
<Polyline key={i} positions={coords} color={isselected?'#10b981':i<3?'#374151':'#1f2937'} weight={isselected?4:i<3?2:1} opacity={isselected?0.9:i<3?0.4:0.15} dashArray={!isselected?'8,12':''} eventHandlers={{click:()=>{setselectedroute(i);if(coords.length>0)setflyto(coords[0])}}}>
<Tooltip sticky className="!bg-gray-900/95 !border-gray-700 !text-gray-200">
<div className="text-[10px] font-mono p-1">
<p className="font-bold text-emerald-400">{r?.origin||"--"} → {r?.destination||"--"}</p>
<p className="text-gray-400">Cost: ${(r?.totalcost||0).toFixed(0)} | {r?.transitdays||0}d | {r?.distancenm||0}nm</p>
<p className="text-gray-500">Country: {r?.origincountry||"--"} | Corridor: {r?.origincorridor||"--"}</p>
{r?.chokepoints&&r.chokepoints.length>0&&<p className="text-red-400">Chokepoints: {r.chokepoints.join(", ")}</p>}
</div>
</Tooltip>
</Polyline>
)})}
{refineries.map((r,i)=>(
<CircleMarker key={`ref-${i}`} center={[r[0],r[1]]} radius={Math.max(3,Math.sqrt(r[3]/80000))} color="#3b82f6" fillColor="#60a5fa" fillOpacity={0.7} weight={2}>
<Popup><div className="text-[10px]"><p className="font-bold text-blue-400">{r[2]}</p><p className="text-gray-400 font-mono">{(r[3]/1000).toFixed(0)}K BPD</p><p className="text-gray-500">Indian Refinery</p></div></Popup>
</CircleMarker>
))}
{sprlocations.map((s,i)=>(
<CircleMarker key={`spr-${i}`} center={[s[0],s[1]]} radius={6} color="#7c3aed" fillColor="#a855f7" fillOpacity={0.7} weight={2}>
<Popup><div className="text-[10px]"><p className="font-bold text-purple-400">{s[2]}</p><p className="text-gray-400 font-mono">{s[3]}M tonnes</p><p className="text-gray-500">Strategic Petroleum Reserve</p></div></Popup>
</CircleMarker>
))}
{originports.map((o,i)=>(
<CircleMarker key={`org-${i}`} center={[o[0],o[1]]} radius={4} color="#f59e0b" fillColor="#fbbf24" fillOpacity={0.7} weight={2}>
<Popup><div className="text-[10px]"><p className="font-bold text-amber-400">{o[2]}</p><p className="text-gray-400">{o[3]}</p><p className="text-gray-500">Crude Origin Port</p></div></Popup>
</CircleMarker>
))}
{chokepoints.map((c,i)=>(
<CircleMarker key={`chk-${i}`} center={[c[0],c[1]]} radius={5} color="#ef4444" fillColor="#f87171" fillOpacity={0.6} weight={2}>
<Tooltip permanent direction="right" offset={[8,0]} className="!bg-transparent !border-0 !shadow-none !p-0"><span className="text-[8px] font-mono text-red-400 bg-black/80 px-1 py-0.5 rounded">{c[2]}</span></Tooltip>
<Popup><div className="text-[10px]"><p className="font-bold text-red-400">{c[2]}</p><p className="text-gray-400 font-mono">{c[3]}M BPD capacity</p><p className="text-gray-500">Maritime Chokepoint</p></div></Popup>
</CircleMarker>
))}
</MapContainer>
<motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.8}} className="absolute top-3 right-3 z-[1000] glass p-2 rounded-lg">
<div className="flex items-center gap-1.5 mb-1.5"><Eye className="w-3 h-3 text-emerald-400"/><span className="text-[8px] font-bold tracking-[0.12em] text-gray-400 uppercase">Legend</span></div>
<div className="flex flex-col gap-0.5 text-[9px]">
<div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-500"/><span className="text-gray-400">Refinery</span></div>
<div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-purple-500"/><span className="text-gray-400">SPR</span></div>
<div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-amber-500"/><span className="text-gray-400">Origin Port</span></div>
<div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500"/><span className="text-gray-400">Chokepoint</span></div>
</div>
</motion.div>
</div>
<motion.div initial={{y:50,opacity:0}} animate={{y:0,opacity:1}} transition={{delay:0.3,duration:0.5}} className="h-44 glass border-t border-gray-800 flex shrink-0">
<div className="flex-1 p-2.5 border-r border-gray-800 overflow-y-auto">
<div className="flex items-center gap-2 mb-1.5">
<Ship className="w-3 h-3 text-emerald-400"/>
<h2 className="text-[9px] font-bold tracking-[0.12em] text-gray-400 uppercase">Adaptive Procurement Rankings</h2>
<span className="text-[8px] font-mono text-gray-600 ml-auto">{(rankedroutes||[]).length} routes</span>
</div>
<div className="flex flex-col gap-0.5">
{(rankedroutes||[]).slice(0,8).map((r,i)=>{
const maxcost=(rankedroutes||[]).length>0?(rankedroutes[rankedroutes.length-1]?.totalcost||1):1
return(
<motion.div key={i} initial={{x:-15,opacity:0}} animate={{x:0,opacity:1}} transition={{delay:0.03*i,duration:0.25}} onClick={()=>{setselectedroute(i);const coords=r?.coordinates;if(Array.isArray(coords)&&coords.length>0)setflyto(coords[0])}} className={`flex items-center gap-2 p-1 rounded cursor-pointer transition-all text-[10px] ${i===selectedroute?'bg-emerald-950/30 border border-emerald-800/50':'hover:bg-gray-800/30 border border-transparent'}`}>
<span className={`font-bold w-4 ${i===selectedroute?'text-emerald-400':'text-gray-600'}`}>#{i+1}</span>
<div className="flex-1 min-w-0">
<p className="font-medium truncate">{r?.origin||"--"} → {r?.destination||"--"}</p>
<div className="h-1 bg-gray-800 rounded-full overflow-hidden mt-0.5">
<div className="h-full rounded-full transition-all duration-700" style={{width:`${Math.max(5,100-((r?.totalcost||0)/maxcost)*80)}%`,background:i===0?'#10b981':i<3?'#3b82f6':'#4b5563'}}/>
</div>
</div>
<div className="flex gap-2 text-[8px] font-mono text-gray-500 shrink-0">
<span>{r?.transitdays||0}d</span>
<span>${(r?.totalcost||0).toFixed(0)}</span>
<span>{r?.distancenm||0}nm</span>
</div>
{r?.chokepoints&&r.chokepoints.length>0&&<div className="flex gap-0.5 shrink-0">{r.chokepoints.slice(0,2).map((cp,ci)=>(<span key={ci} className="text-[7px] bg-red-950/50 text-red-400 px-1 rounded">{(cp||"").substring(0,8)}</span>))}</div>}
</motion.div>
)})}
</div>
</div>
<div className="w-56 p-2.5 flex flex-col shrink-0">
<div className="flex items-center gap-2 mb-1.5">
<TrendingDown className="w-3 h-3 text-cyan-400"/>
<h2 className="text-[9px] font-bold tracking-[0.12em] text-gray-400 uppercase">Cost Analysis</h2>
</div>
<div className="flex-1">
<ResponsiveContainer width="100%" height="100%">
<BarChart data={routecostdata} barSize={10}>
<CartesianGrid strokeDasharray="3 3" stroke="#1f2937"/>
<XAxis dataKey="name" tick={{fontSize:7,fill:'#6b7280'}} axisLine={false} tickLine={false}/>
<YAxis tick={{fontSize:7,fill:'#6b7280'}} axisLine={false} tickLine={false}/>
<Bar dataKey="cost" radius={[3,3,0,0]}>
{routecostdata.map((entry,i)=>(<Cell key={i} fill={i===0?'#10b981':i<3?'#3b82f6':'#4b5563'}/>))}
</Bar>
</BarChart>
</ResponsiveContainer>
</div>
</div>
</motion.div>
</div>
</div>
<motion.div initial={{y:20,opacity:0}} animate={{y:0,opacity:1}} transition={{delay:0.5,duration:0.4}} className="h-9 glass border-t border-gray-800 flex items-center px-4 gap-3 z-[1500] shrink-0">
<Zap className="w-3 h-3 text-emerald-500"/>
<span className="text-[8px] font-bold tracking-[0.12em] text-emerald-500 uppercase shrink-0">AI Advisory</span>
<div className="flex-1 overflow-hidden">
<p className="text-[10px] text-gray-300 font-mono truncate">{typedreport||"Initializing advisory engine..."}<span className="animate-pulse text-emerald-500">|</span></p>
</div>
</motion.div>
</div>
</ErrorBoundary>
)
}