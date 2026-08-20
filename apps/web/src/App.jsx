import React from 'react'
import { useState } from 'react'
import { useEffect } from 'react'
import { useRef } from 'react'
import { MapContainer } from 'react-leaflet'
import { TileLayer } from 'react-leaflet'
import { Polyline } from 'react-leaflet'
import { CircleMarker } from 'react-leaflet'
import { Tooltip } from 'react-leaflet'
import { Marker } from 'react-leaflet'
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
import { AnimatePresence } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'
import { ShieldAlert } from 'lucide-react'
import { Ship } from 'lucide-react'
import { Droplet } from 'lucide-react'
import { Radio } from 'lucide-react'
import { Activity } from 'lucide-react'
import { Globe } from 'lucide-react'
import { Fuel } from 'lucide-react'
import { TrendingDown } from 'lucide-react'
import { Navigation } from 'lucide-react'
import { Zap } from 'lucide-react'
import { Eye } from 'lucide-react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './index.css'
function MapController({flyto}){
const map=useMap()
useEffect(()=>{
if(flyto){
map.flyTo(flyto,5,{duration:2})
}
},[flyto,map])
return null
}
function AnimatedCounter({value,suffix="",prefix="",decimals=0}){
const[display,setdisplay]=useState(0)
useEffect(()=>{
const target=parseFloat(value)||0
const duration=1500
const steps=60
const increment=(target-display)/steps
let current=display
let step=0
const timer=setInterval(()=>{
step++
current+=increment
if(step>=steps){
current=target
clearInterval(timer)
}
setdisplay(current)
},duration/steps)
return()=>clearInterval(timer)
},[value])
return<span>{prefix}{display.toFixed(decimals)}{suffix}</span>
}
export default function App(){
const[matrixdata,setmatrixdata]=useState(null)
const[connected,setconnected]=useState(false)
const[activetab,setactivetab]=useState("map")
const[activescenario,setactivescenario]=useState("hormuz_closure")
const[flyto,setflyto]=useState(null)
const[selectedroute,setselectedroute]=useState(0)
const socketref=useRef(null)
const[typedreport,settypedreport]=useState("")
const reportref=useRef("")
useEffect(()=>{
const issecure=window.location.protocol==="https:"
const protocol=issecure?"wss://":"ws://"
const wsurl=protocol+window.location.hostname+":8000/ws"
const socket=new WebSocket(wsurl)
socketref.current=socket
socket.onopen=()=>{
setconnected(true)
socket.send(JSON.stringify({scenario:activescenario}))
}
socket.onmessage=(event)=>{
const data=JSON.parse(event.data)
setmatrixdata(data)
if(data.report&&data.report!==reportref.current){
reportref.current=data.report
settypedreport("")
let i=0
const typeInterval=setInterval(()=>{
if(i<data.report.length){
settypedreport(prev=>prev+data.report[i])
i++
}else{
clearInterval(typeInterval)
}
},20)
}
}
socket.onclose=()=>{setconnected(false)}
socket.onerror=()=>{setconnected(false)}
return()=>{socket.close()}
},[])
function switchscenario(scenarioid){
setactivescenario(scenarioid)
if(socketref.current&&socketref.current.readyState===1){
socketref.current.send(JSON.stringify({scenario:scenarioid}))
}
}
const rankedroutes=matrixdata?.routes||[]
const corridorrisks=matrixdata?.corridorrisks||{}
const drawdown=matrixdata?.drawdown||{}
const gridstats=matrixdata?.gridstats||{}
const sprmetadata=matrixdata?.sprmetadata||{}
const riskcorridors=[
{name:"Hormuz",key:"hormuz",color:"#ef4444"},
{name:"Red Sea",key:"redsea",color:"#f97316"},
{name:"Suez",key:"suez",color:"#eab308"},
{name:"Cape",key:"cape",color:"#22c55e"},
{name:"Malacca",key:"malacca",color:"#06b6d4"},
{name:"W.Africa",key:"westafrica",color:"#8b5cf6"},
{name:"US Gulf",key:"usgulf",color:"#ec4899"},
{name:"Pacific",key:"pacific",color:"#14b8a6"}
]
const sprtimelinedata=[
{day:"Normal",spr:sprmetadata.coveragedays||9.5},
{day:"Current",spr:drawdown.sprremainingdays||9.5},
{day:"Projected",spr:Math.max(0,(drawdown.sprremainingdays||9.5)-2)}
]
const routecostdata=rankedroutes.slice(0,6).map((r,i)=>({name:r.origin?.substring(0,8)||"Rt"+i,cost:r.totalcost||0,days:r.transitdays||0}))
const scenariobuttons=[
{id:"hormuz_closure",label:"Hormuz Closure"},
{id:"redsea_houthi",label:"Red Sea Attack"},
{id:"dual_blockade",label:"Doomsday"},
{id:"russia_embargo",label:"Russia Embargo"},
{id:"iran_sanctions",label:"Iran Sanctions"}
]
function getthreatclass(risk){
if(risk>=0.7)return"threat-critical"
if(risk>=0.4)return"threat-high"
if(risk>=0.2)return"threat-moderate"
return"threat-low"
}
const refineries=matrixdata?[
[22.47,70.06,"Jamnagar",1240000],[22.37,69.72,"Vadinar",400000],[19.08,72.88,"Mumbai",300000],
[9.93,76.27,"Kochi",310000],[13.08,80.27,"Chennai",210000],[20.32,86.61,"Paradip",300000],
[22.07,88.10,"Haldia",160000],[17.69,83.22,"Vizag",166000],[12.87,74.88,"Mangalore",300000]
]:[]
const sprlocations=matrixdata?[
[17.72,83.30,"Vizag SPR",1.33],[12.90,74.85,"Mangalore SPR",1.50],[12.65,74.90,"Padur SPR",2.50]
]:[]
const chokepoints=matrixdata?[
[26.57,56.25,"Hormuz"],[12.58,43.33,"Bab el-Mandeb"],[30.45,32.35,"Suez"],[-34.36,18.47,"Cape"],[2.50,101.50,"Malacca"]
]:[]
return(
<div className="flex flex-col h-screen w-screen bg-gray-950 text-white overflow-hidden">
<motion.header initial={{y:-60,opacity:0}} animate={{y:0,opacity:1}} transition={{duration:0.6,ease:"easeOut"}} className="h-12 glass flex items-center justify-between px-4 z-[2000] border-b border-gray-800">
<div className="flex items-center gap-3">
<ShieldAlert className="text-emerald-500 w-5 h-5"/>
<span className="text-sm font-bold tracking-[0.2em] text-gray-200">INDIA ENERGY COMMAND CENTER</span>
<span className="text-[10px] text-gray-600 font-mono ml-2">v2.0</span>
</div>
<div className="flex items-center gap-4">
<div className="flex items-center gap-2 text-[10px] font-mono text-gray-500">
<Globe className="w-3 h-3"/>
<span>{gridstats.refineries||0} REFINERIES</span>
<span>|</span>
<span>{gridstats.originports||0} PORTS</span>
<span>|</span>
<span>{gridstats.chokepoints||0} CHOKEPOINTS</span>
</div>
<div className="flex items-center gap-1.5">
<div className={`w-2 h-2 rounded-full ${connected?'bg-emerald-500 animate-pulse':'bg-red-500'}`}/>
<span className="text-[10px] font-mono text-gray-400">{connected?'LIVE':'OFFLINE'}</span>
</div>
<span className="text-[10px] font-mono text-gray-600">{matrixdata?.source==="live"?"RSS FEED":"FALLBACK"}</span>
</div>
</motion.header>
<div className="flex items-center gap-2 px-4 py-1.5 bg-gray-900/80 border-b border-gray-800 z-[1500]">
<span className="text-[10px] text-gray-500 font-mono mr-2">SCENARIO:</span>
{scenariobuttons.map(s=>(
<button key={s.id} onClick={()=>switchscenario(s.id)} className={`text-[10px] font-mono px-2.5 py-1 rounded transition-all duration-300 ${activescenario===s.id?'bg-emerald-900/50 text-emerald-400 border border-emerald-700':'bg-gray-800/50 text-gray-500 border border-gray-700 hover:text-gray-300 hover:border-gray-600'}`}>{s.label}</button>
))}
</div>
<div className="flex flex-1 overflow-hidden">
<motion.div initial={{x:-320,opacity:0}} animate={{x:0,opacity:1}} transition={{duration:0.8,ease:"easeOut",delay:0.2}} className="w-72 h-full flex flex-col gap-3 p-3 z-[1000] glass border-r border-gray-800 overflow-y-auto">
<div className="relative">
<div className="flex items-center gap-2 mb-2">
<AlertTriangle className="w-3.5 h-3.5 text-red-500"/>
<h2 className="text-[10px] font-bold tracking-[0.15em] text-gray-400 uppercase">Corridor Risk Matrix</h2>
</div>
<div className="flex flex-col gap-1.5">
{riskcorridors.map((c,i)=>{
const risk=corridorrisks[c.key]||0
return(
<motion.div key={c.key} initial={{x:-20,opacity:0}} animate={{x:0,opacity:1}} transition={{delay:0.1*i,duration:0.4}} className={`p-2 rounded ${getthreatclass(risk)} flex items-center justify-between`}>
<span className="text-[11px] font-medium">{c.name}</span>
<div className="flex items-center gap-2">
<div className="w-16 h-1.5 bg-gray-800 rounded-full overflow-hidden">
<motion.div initial={{width:0}} animate={{width:`${risk*100}%`}} transition={{duration:1,delay:0.2*i}} className="h-full rounded-full" style={{background:c.color}}/>
</div>
<span className="text-[10px] font-mono w-8 text-right" style={{color:c.color}}>{(risk*100).toFixed(0)}%</span>
</div>
</motion.div>
)})}
</div>
</div>
<div className="border-t border-gray-800 pt-3">
<div className="flex items-center gap-2 mb-2">
<Droplet className="w-3.5 h-3.5 text-purple-400"/>
<h2 className="text-[10px] font-bold tracking-[0.15em] text-gray-400 uppercase">SPR Status</h2>
</div>
<div className="grid grid-cols-2 gap-2">
<div className="bg-black/40 p-2 rounded border border-gray-800">
<p className="text-[9px] text-gray-500 uppercase">Remaining</p>
<p className="text-lg text-purple-400 font-mono"><AnimatedCounter value={drawdown.sprremainingdays||0} decimals={1} suffix="d"/></p>
</div>
<div className="bg-black/40 p-2 rounded border border-gray-800">
<p className="text-[9px] text-gray-500 uppercase">Status</p>
<p className={`text-sm font-bold ${drawdown.status==="Stable"?'text-emerald-400':drawdown.status==="Critical"?'text-red-400':'text-orange-400'}`}>{drawdown.status||"--"}</p>
</div>
<div className="bg-black/40 p-2 rounded border border-gray-800">
<p className="text-[9px] text-gray-500 uppercase">GDP Impact</p>
<p className="text-sm text-red-400 font-mono"><AnimatedCounter value={(drawdown.gdppenalty||0)/1000000000} decimals={1} prefix="-$" suffix="B"/></p>
</div>
<div className="bg-black/40 p-2 rounded border border-gray-800">
<p className="text-[9px] text-gray-500 uppercase">Deficit</p>
<p className="text-sm text-orange-400 font-mono"><AnimatedCounter value={(drawdown.deficitbarrels||0)/1000000} decimals={1} suffix="M bbl"/></p>
</div>
</div>
<div className="h-20 w-full mt-2">
<ResponsiveContainer width="100%" height="100%">
<AreaChart data={sprtimelinedata}>
<defs>
<linearGradient id="sprgradient" x1="0" y1="0" x2="0" y2="1">
<stop offset="5%" stopColor="#7c3aed" stopOpacity={0.4}/>
<stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
</linearGradient>
</defs>
<XAxis dataKey="day" tick={{fontSize:9,fill:'#6b7280'}} axisLine={false} tickLine={false}/>
<YAxis domain={[0,10]} hide/>
<Area type="monotone" dataKey="spr" stroke="#a855f7" fill="url(#sprgradient)" strokeWidth={2}/>
</AreaChart>
</ResponsiveContainer>
</div>
</div>
<div className="border-t border-gray-800 pt-3">
<div className="flex items-center gap-2 mb-2">
<Activity className="w-3.5 h-3.5 text-emerald-400"/>
<h2 className="text-[10px] font-bold tracking-[0.15em] text-gray-400 uppercase">Intelligence Feed</h2>
</div>
<div className="p-2 bg-black/40 rounded border border-gray-800 max-h-32 overflow-y-auto">
<p className="text-[11px] text-gray-300 leading-relaxed">{matrixdata?.news||"Awaiting intelligence feed..."}</p>
</div>
</div>
</motion.div>
<div className="flex-1 h-full flex flex-col relative z-0">
<div className="flex-1 relative">
<MapContainer center={[20.0,55.0]} zoom={3} style={{width:"100%",height:"100%"}} zoomControl={false} attributionControl={false}>
<TileLayer url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"/>
<MapController flyto={flyto}/>
{rankedroutes.slice(0,8).map((r,i)=>(
<Polyline key={i} positions={r.coordinates||[]} color={i===selectedroute?'#10b981':i<3?'#374151':'#1f2937'} weight={i===selectedroute?4:i<3?2:1} opacity={i===selectedroute?0.9:i<3?0.5:0.2} dashArray={i!==selectedroute?'8,12':''}/>
))}
{refineries.map((r,i)=>(
<CircleMarker key={`ref-${i}`} center={[r[0],r[1]]} radius={Math.max(4,Math.sqrt(r[3]/50000))} color="#3b82f6" fillColor="#60a5fa" fillOpacity={0.7} weight={2}>
<Popup className="glass"><div className="text-xs"><p className="font-bold text-blue-400">{r[2]}</p><p className="text-gray-400 font-mono">{(r[3]/1000).toFixed(0)}K BPD</p></div></Popup>
<Tooltip direction="top" offset={[0,-5]}><span className="text-[10px]">{r[2]}</span></Tooltip>
</CircleMarker>
))}
{sprlocations.map((s,i)=>(
<CircleMarker key={`spr-${i}`} center={[s[0],s[1]]} radius={7} color="#7c3aed" fillColor="#a855f7" fillOpacity={0.7} weight={2}>
<Popup><div className="text-xs"><p className="font-bold text-purple-400">{s[2]}</p><p className="text-gray-400 font-mono">{s[3]}M tonnes</p></div></Popup>
<Tooltip direction="top" offset={[0,-5]}><span className="text-[10px]">{s[2]}</span></Tooltip>
</CircleMarker>
))}
{chokepoints.map((c,i)=>(
<CircleMarker key={`chk-${i}`} center={[c[0],c[1]]} radius={5} color="#ef4444" fillColor="#f87171" fillOpacity={0.6} weight={2}>
<Tooltip permanent direction="right" offset={[8,0]} className="!bg-transparent !border-0 !shadow-none !p-0"><span className="text-[9px] font-mono text-red-400 bg-black/70 px-1 py-0.5 rounded">{c[2]}</span></Tooltip>
</CircleMarker>
))}
</MapContainer>
<motion.div initial={{y:20,opacity:0}} animate={{y:0,opacity:1}} transition={{delay:1,duration:0.6}} className="absolute top-4 right-4 z-[1000] glass p-3 rounded-lg max-w-xs">
<div className="flex items-center gap-2 mb-2">
<Eye className="w-3 h-3 text-emerald-400"/>
<span className="text-[9px] font-bold tracking-[0.15em] text-gray-400 uppercase">Legend</span>
</div>
<div className="flex flex-col gap-1 text-[10px]">
<div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500"/><span className="text-gray-400">Indian Refinery</span></div>
<div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-purple-500"/><span className="text-gray-400">SPR Location</span></div>
<div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500"/><span className="text-gray-400">Chokepoint</span></div>
<div className="flex items-center gap-2"><div className="w-6 h-0.5 bg-emerald-500 rounded"/><span className="text-gray-400">Optimal Route</span></div>
<div className="flex items-center gap-2"><div className="w-6 h-0.5 bg-gray-500 rounded" style={{borderTop:'1px dashed #6b7280'}}/><span className="text-gray-400">Alt Route</span></div>
</div>
</motion.div>
</div>
<motion.div initial={{y:60,opacity:0}} animate={{y:0,opacity:1}} transition={{delay:0.4,duration:0.6}} className="h-52 glass border-t border-gray-800 flex">
<div className="flex-1 p-3 border-r border-gray-800 overflow-y-auto">
<div className="flex items-center gap-2 mb-2">
<Ship className="w-3.5 h-3.5 text-emerald-400"/>
<h2 className="text-[10px] font-bold tracking-[0.15em] text-gray-400 uppercase">Adaptive Procurement Rankings</h2>
<span className="text-[9px] font-mono text-gray-600 ml-auto">{rankedroutes.length} routes analyzed</span>
</div>
<div className="flex flex-col gap-1">
{rankedroutes.slice(0,6).map((r,i)=>{
const maxcost=rankedroutes.length>0?rankedroutes[rankedroutes.length-1].totalcost:1
return(
<motion.div key={i} initial={{x:-20,opacity:0}} animate={{x:0,opacity:1}} transition={{delay:0.05*i,duration:0.3}} onClick={()=>{setselectedroute(i);if(r.coordinates&&r.coordinates.length>0)setflyto(r.coordinates[0])}} className={`flex items-center gap-3 p-1.5 rounded cursor-pointer transition-all duration-300 ${i===selectedroute?'bg-emerald-950/30 border border-emerald-800/50':'hover:bg-gray-800/50 border border-transparent'}`}>
<span className={`text-[10px] font-bold w-4 ${i===selectedroute?'text-emerald-400':'text-gray-600'}`}>#{i+1}</span>
<div className="flex-1 min-w-0">
<p className="text-[11px] font-medium truncate">{r.origin||"--"} → {r.destination||"--"}</p>
<div className="flex items-center gap-1 mt-0.5">
<div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
<div className="route-rank-bar" style={{width:`${Math.max(5,100-(r.totalcost/maxcost)*100)}%`,background:i===0?'linear-gradient(90deg,#10b981,#059669)':i<3?'linear-gradient(90deg,#3b82f6,#2563eb)':'linear-gradient(90deg,#6b7280,#4b5563)'}}/>
</div>
</div>
</div>
<div className="flex gap-3 text-[9px] font-mono text-gray-500 shrink-0">
<span>{r.transitdays||0}d</span>
<span>${(r.totalcost||0).toFixed(0)}</span>
<span>{r.distancenm||0}nm</span>
</div>
{r.chokepoints&&r.chokepoints.length>0&&<div className="flex gap-1">{r.chokepoints.slice(0,2).map((cp,ci)=>(<span key={ci} className="text-[8px] bg-red-950/50 text-red-400 px-1 py-0.5 rounded">{cp.substring(0,6)}</span>))}</div>}
</motion.div>
)})}
</div>
</div>
<div className="w-64 p-3 flex flex-col">
<div className="flex items-center gap-2 mb-2">
<TrendingDown className="w-3.5 h-3.5 text-cyan-400"/>
<h2 className="text-[10px] font-bold tracking-[0.15em] text-gray-400 uppercase">Cost Analysis</h2>
</div>
<div className="flex-1">
<ResponsiveContainer width="100%" height="100%">
<BarChart data={routecostdata} barSize={12}>
<CartesianGrid strokeDasharray="3 3" stroke="#1f2937"/>
<XAxis dataKey="name" tick={{fontSize:8,fill:'#6b7280'}} axisLine={false} tickLine={false}/>
<YAxis tick={{fontSize:8,fill:'#6b7280'}} axisLine={false} tickLine={false}/>
<Bar dataKey="cost" radius={[4,4,0,0]}>
{routecostdata.map((entry,i)=>(
<Cell key={i} fill={i===0?'#10b981':i<3?'#3b82f6':'#4b5563'}/>
))}
</Bar>
</BarChart>
</ResponsiveContainer>
</div>
</div>
</motion.div>
</div>
</div>
<motion.div initial={{y:30,opacity:0}} animate={{y:0,opacity:1}} transition={{delay:0.6,duration:0.5}} className="h-10 glass border-t border-gray-800 flex items-center px-4 gap-3 z-[1500]">
<Zap className="w-3 h-3 text-emerald-500"/>
<span className="text-[9px] font-bold tracking-[0.15em] text-emerald-500 uppercase shrink-0">AI Advisory</span>
<div className="flex-1 overflow-hidden">
<p className="text-[11px] text-gray-300 font-mono truncate typewriter">{typedreport||"Initializing advisory engine..."}</p>
</div>
</motion.div>
</div>
)
}