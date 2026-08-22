import re

with open('index.css', 'r', encoding='utf-8') as f:
    content = f.read()

# Add animation for the shipping routes
route_animation = '''
@keyframes route-flow {
  to {
    stroke-dashoffset: -16;
  }
}
.animated-route path {
  animation: route-flow 1s linear infinite;
}
'''
if "route-flow" not in content:
    content += route_animation

with open('index.css', 'w', encoding='utf-8') as f:
    f.write(content)

with open('App.jsx', 'r', encoding='utf-8') as f:
    app_content = f.read()

# Add the className to the Polyline
old_poly = r'<Polyline key=\{i\} positions=\{coords\} color=\{isselected\?\'#b5a642\':\'#1f2937\'\} weight=\{isselected\?2:1\} opacity=\{isselected\?1:0\.6\} dashArray="8,8" eventHandlers=\{\{click:\(\)=>\{setselectedroute\(i\);if\(coords\.length>0\)setflyto\(coords\[0\]\)\}\}\}\>'
new_poly = r'<Polyline className={isselected ? "animated-route" : ""} key={i} positions={coords} color={isselected?"#b5a642":"#1f2937"} weight={isselected?2:1} opacity={isselected?1:0.6} dashArray="8,8" eventHandlers={{click:()=>{setselectedroute(i);if(coords.length>0)setflyto(coords[0])}}}>'

app_content = re.sub(old_poly, new_poly, app_content)

with open('App.jsx', 'w', encoding='utf-8') as f:
    f.write(app_content)
