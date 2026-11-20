/* Problems pulled from Nolan's WebAssign course (MATH 212, Fall 2026). Loaded by every module.
   See the WA block in study.js for the entry format. Generated entries are appended below. */
window.WA_PROBLEMS=window.WA_PROBLEMS||[];

/* ---------- Week 3 HW (Gradescope, due 2026-09-11, extension to 09-13) ---------- */
WA_PROBLEMS.push(
{id:'hw3-1',source:'Week 3 HW',hw:'',num:1,module:'02-lines-planes-surfaces',chapter:'planes',status:'hw',
 prompt:'Find an equation for the plane that contains the points \\((0,-2,5)\\) and \\((-1,3,1)\\) and is perpendicular to the plane \\(5x+4y-2z=0\\).',
 parts:[{k:'E',label:'equation:',kind:'equation',ans:e=>6*e.x-22*e.y-29*e.z+101,eq:'6x-22y-29z=-101',vars:['x','y','z'],xwide:true,placeholder:'ax + by + cz = d'}],
 solution:'Two directions inside the plane: \\(\\overrightarrow{PQ}=\\langle -1,5,-4\\rangle\\) and, because the planes are perpendicular, the given normal \\(\\mathbf{n}_0=\\langle 5,4,-2\\rangle\\). Cross them: \\(\\mathbf{n}=\\overrightarrow{PQ}\\times\\mathbf{n}_0=\\langle 6,-22,-29\\rangle\\). Through \\((0,-2,5)\\): \\(d=0+44-145=-101\\), so \\(6x-22y-29z=-101\\). Check the second point: \\(-6-66-29=-101\\). Check \\(\\mathbf{n}\\cdot\\mathbf{n}_0=30-88+58=0\\).'},
{id:'hw3-2',source:'Week 3 HW',hw:'',num:2,module:'02-lines-planes-surfaces',chapter:'relations',status:'hw',
 prompt:'Find the distance from the plane \\(2x-3y+z=4\\) to the plane \\(4x-6y+2z=1\\). Exact or a decimal to three places.',
 parts:[{k:'dist',label:'\\(D=\\)',kind:'number',ans:Math.sqrt(14)/4,tol:0.005}],
 solution:'Divide the second equation by 2 so the normals match: \\(2x-3y+z=\\tfrac12\\). Now the gap is \\(|4-\\tfrac12|/|\\mathbf{n}|\\) with \\(|\\mathbf{n}|=\\sqrt{4+9+1}=\\sqrt{14}\\): \\(D=\\dfrac{7/2}{\\sqrt{14}}=\\dfrac{7}{2\\sqrt{14}}=\\dfrac{\\sqrt{14}}{4}\\approx 0.935\\).'},
{id:'hw3-3',source:'Week 3 HW',hw:'',num:3,module:'02-lines-planes-surfaces',chapter:'relations',status:'hw',
 prompt:'Find the distance from the line \\(x=1+t,\\ y=1+6t,\\ z=2t\\) to the line \\(x=1+2s,\\ y=5+15s,\\ z=-2+6s\\).',
 parts:[{k:'dist',label:'\\(D=\\)',kind:'number',ans:2,tol:0.005}],
 solution:'Directions \\(\\mathbf{v}_1=\\langle 1,6,2\\rangle\\) and \\(\\mathbf{v}_2=\\langle 2,15,6\\rangle\\) are not parallel, so first check they do not meet: they are skew (the two-equation solve fails the third equation). A vector perpendicular to both: \\(\\mathbf{n}=\\mathbf{v}_1\\times\\mathbf{v}_2=\\langle 36-30,\\ 4-6,\\ 15-12\\rangle=\\langle 6,-2,3\\rangle\\), \\(|\\mathbf{n}|=7\\). Join the base points: \\(\\overrightarrow{P_1P_2}=\\langle 0,4,-2\\rangle\\). Then \\(D=\\dfrac{|\\langle 0,4,-2\\rangle\\cdot\\langle 6,-2,3\\rangle|}{7}=\\dfrac{|-8-6|}{7}=2\\).'},
{id:'hw3-4',source:'Week 3 HW',hw:'',num:4,module:'03-vector-functions',chapter:'curves',status:'hw',
 prompt:'Give parametric equations that trace out the curve that is the intersection of the plane \\(x+2y+3z=7\\) with the surface \\(x^2+z^2=9\\). Use \\(x=3\\cos t\\), \\(z=3\\sin t\\).',
 parts:[{k:'r',label:'\\(\\mathbf{r}(t)=\\)',kind:'exprVector',ans:['3cos(t)','(7-3cos(t)-9sin(t))/2','3sin(t)'],vars:['t'],xwide:true,placeholder:'<x(t), y(t), z(t)>'}],
 solution:'The surface \\(x^2+z^2=9\\) is a cylinder of radius 3 around the \\(y\\)-axis, so it forces \\(x=3\\cos t\\), \\(z=3\\sin t\\). The plane then supplies \\(y\\): \\(2y=7-x-3z=7-3\\cos t-9\\sin t\\), so \\(\\mathbf{r}(t)=\\left\\langle 3\\cos t,\\ \\tfrac{7-3\\cos t-9\\sin t}{2},\\ 3\\sin t\\right\\rangle\\), \\(0\\le t\\le 2\\pi\\). Equivalently \\(x=3\\cos t\\), \\(y=\\tfrac{7}{2}-\\tfrac32\\cos t-\\tfrac92\\sin t\\), \\(z=3\\sin t\\).'},
{id:'hw3-5b',source:'Week 3 HW',hw:'',num:5,module:'03-vector-functions',chapter:'reparam',status:'hw',
 prompt:'Let \\(C\\) be the intersection of \\(y=x^2\\) and \\(z=xy\\), traced by \\(\\mathbf{p}(t)=\\langle t,t^2,t^3\\rangle\\). Each of \\(\\mathbf{q}(u)=\\langle u^2,u^4,u^6\\rangle\\), \\(\\mathbf{r}(s)=\\langle -s,s^2,-s^3\\rangle\\), \\(\\mathbf{m}(w)=\\langle w^3,w^6,w^9\\rangle\\) also lies on \\(C\\). Describe how each differs from \\(\\mathbf{p}\\).',
 parts:[
  {k:'q',label:'\\(\\mathbf{q}(u)=\\langle u^2,u^4,u^6\\rangle\\):',kind:'choice',options:['covers all of \\(C\\), same direction as \\(\\mathbf{p}\\)','covers all of \\(C\\), opposite direction','covers only the part with \\(x\\ge 0\\), retracing it','does not stay on \\(C\\)'],ans:2},
  {k:'r',label:'\\(\\mathbf{r}(s)=\\langle -s,s^2,-s^3\\rangle\\):',kind:'choice',options:['covers all of \\(C\\), same direction as \\(\\mathbf{p}\\)','covers all of \\(C\\), opposite direction','covers only the part with \\(x\\ge 0\\), retracing it','does not stay on \\(C\\)'],ans:1},
  {k:'m',label:'\\(\\mathbf{m}(w)=\\langle w^3,w^6,w^9\\rangle\\):',kind:'choice',options:['covers all of \\(C\\), same direction as \\(\\mathbf{p}\\)','covers all of \\(C\\), opposite direction','covers only the part with \\(x\\ge 0\\), retracing it','does not stay on \\(C\\)'],ans:0},
  {k:'sp',label:'Which of them moves at the same speed as \\(\\mathbf{p}\\) at every shared point?',kind:'choice',options:['\\(\\mathbf{r}\\) only','\\(\\mathbf{m}\\) only','both \\(\\mathbf{r}\\) and \\(\\mathbf{m}\\)','neither'],ans:0}],
 solution:'All three are \\(\\mathbf{p}(g(\\cdot))\\): \\(\\mathbf{q}(u)=\\mathbf{p}(u^2)\\), \\(\\mathbf{r}(s)=\\mathbf{p}(-s)\\), \\(\\mathbf{m}(w)=\\mathbf{p}(w^3)\\), so each lies on \\(C\\). Coverage is the range of \\(g\\): \\(u^2\\ge 0\\) reaches only \\(x\\ge 0\\), while \\(-s\\) and \\(w^3\\) reach every real \\(x\\). Direction is the sign of \\(g^\\prime\\): \\(2u\\) changes sign at \\(u=0\\) (\\(\\mathbf{q}\\) comes in and goes back out), \\(-1<0\\) (\\(\\mathbf{r}\\) runs backwards), \\(3w^2\\ge 0\\) (\\(\\mathbf{m}\\) runs forward). Speed is \\(|g^\\prime|\\) times the speed of \\(\\mathbf{p}\\): \\(|\\mathbf{r}^\\prime(s)|=|\\mathbf{p}^\\prime(-s)|\\) exactly, but \\(|\\mathbf{m}^\\prime(w)|=3w^2|\\mathbf{p}^\\prime(w^3)|\\), which is slower for \\(|w|<1/\\sqrt3\\) (it pauses at \\(w=0\\)) and faster beyond.'}
);

/* ---------- WebAssign: Extrema (due 2026-10-05) ---------- */
WA_PROBLEMS.push(
{id:'wa-ext-1',source:'WebAssign: Extrema',hw:'',num:1,module:'06-optimization',chapter:'critical',status:'wa',
 prompt:'Find the local maximum and minimum values and saddle points of \\(f(x,y)=x^4-2x^2+y^3-3y\\). If there is none, enter DNE. List each distinct value once.',
 parts:[
  {k:'max',label:'local maximum value(s):',kind:'numberList',ans:[2]},
  {k:'min',label:'local minimum value(s):',kind:'numberList',ans:[-3]},
  {k:'sad',label:'saddle point(s):',kind:'pointList',ans:[[0,1],[1,-1],[-1,-1]]}],
 solution:'Set both partials to zero: \\(f_x=4x^3-4x=4x(x-1)(x+1)=0\\) gives \\(x\\in\\{0,\\pm1\\}\\), and \\(f_y=3y^2-3=0\\) gives \\(y=\\pm1\\). That is six critical points. The second derivatives are \\(f_{xx}=12x^2-4\\), \\(f_{yy}=6y\\), \\(f_{xy}=0\\), so \\(D=f_{xx}f_{yy}=6y(12x^2-4)\\). At \\((0,-1)\\): \\(D=24>0\\), \\(f_{xx}=-4<0\\), a local maximum with \\(f=2\\). At \\((\\pm1,1)\\): \\(D=48>0\\), \\(f_{xx}=8>0\\), local minima with \\(f=1-2+1-3=-3\\) (one value, listed once). At \\((0,1)\\): \\(D=-24<0\\), and at \\((\\pm1,-1)\\): \\(D=-48<0\\), saddle points.'},
{id:'wa-ext-2',source:'WebAssign: Extrema',hw:'',num:2,module:'06-optimization',chapter:'critical',status:'wa',
 prompt:'Find the local maximum and minimum values and saddle points of \\(f(x,y)=(x-y)(16-xy)\\). If there is none, enter DNE.',
 parts:[
  {k:'max',label:'local maximum value(s):',kind:'numberList',ans:[]},
  {k:'min',label:'local minimum value(s):',kind:'numberList',ans:[]},
  {k:'sad',label:'saddle point(s):',kind:'pointList',ans:[[4,4],[-4,-4]]}],
 solution:'Expand: \\(f=16x-x^2y-16y+xy^2\\). Then \\(f_x=16-2xy+y^2\\) and \\(f_y=-16-x^2+2xy\\). Adding the two equations cancels the \\(xy\\) terms and the constants: \\(y^2-x^2=0\\), so \\(y=\\pm x\\). If \\(y=-x\\), then \\(f_x=16+2x^2+x^2=16+3x^2=0\\), which has no real solution. If \\(y=x\\), then \\(f_x=16-x^2=0\\), so \\(x=\\pm4\\): the critical points are \\((4,4)\\) and \\((-4,-4)\\). Second derivatives: \\(f_{xx}=-2y\\), \\(f_{yy}=2x\\), \\(f_{xy}=-2x+2y\\). At both points \\(f_{xy}=0\\) and \\(D=(-2y)(2x)=-4xy=-64<0\\). Both are saddle points, so there is no local maximum or minimum (DNE).'},
{id:'wa-ext-3',source:'WebAssign: Extrema',hw:'',num:3,module:'06-optimization',chapter:'critical',status:'wa',
 prompt:'Find the local maximum and minimum values and saddle points of \\(f(x,y)=x^3+y^3-3x^2-9y^2-9x\\). If there is none, enter DNE.',
 parts:[
  {k:'max',label:'local maximum value(s):',kind:'numberList',ans:[5]},
  {k:'min',label:'local minimum value(s):',kind:'numberList',ans:[-135]},
  {k:'sad',label:'saddle point(s):',kind:'pointList',ans:[[3,0],[-1,6]]}],
 solution:'The variables separate. \\(f_x=3x^2-6x-9=3(x-3)(x+1)=0\\) gives \\(x=3\\) or \\(-1\\). \\(f_y=3y^2-18y=3y(y-6)=0\\) gives \\(y=0\\) or \\(6\\). Four critical points. With \\(f_{xx}=6x-6\\), \\(f_{yy}=6y-18\\), \\(f_{xy}=0\\): at \\((-1,0)\\), \\(f_{xx}=-12\\), \\(f_{yy}=-18\\), \\(D=216>0\\), a local maximum with \\(f(-1,0)=-1+0-3-0+9=5\\). At \\((3,6)\\): \\(f_{xx}=12\\), \\(f_{yy}=18\\), \\(D>0\\), a local minimum with \\(f=27+216-27-324-27=-135\\). At \\((3,0)\\): \\(f_{xx}=12\\), \\(f_{yy}=-18\\), \\(D<0\\), and at \\((-1,6)\\): \\(f_{xx}=-12\\), \\(f_{yy}=18\\), \\(D<0\\). Those two are saddle points.'},
{id:'wa-ext-4',source:'WebAssign: Extrema',hw:'',num:4,module:'06-optimization',chapter:'absolute',status:'wa',
 prompt:'Find the absolute maximum and minimum values of \\(f(x,y)=x^2+y^2+x^2y+8\\) on the square \\(D=\\{(x,y):|x|\\le1,\\ |y|\\le1\\}\\). Work through the steps.',
 parts:[
  {k:'fx',label:'\\(f_x=\\)',kind:'expr',ans:'2x+2*x*y',vars:['x','y']},
  {k:'fy',label:'\\(f_y=\\)',kind:'expr',ans:'2y+x^2',vars:['x','y']},
  {k:'cp',label:'critical point in the interior:',kind:'vector',ans:[0,0],placeholder:'(x, y)'},
  {k:'fcp',label:'\\(f\\) at the critical point:',kind:'number',ans:8},
  {k:'b1min',label:'edge \\(y=-1\\), minimum:',kind:'number',ans:9},
  {k:'b1max',label:'edge \\(y=-1\\), maximum:',kind:'number',ans:9},
  {k:'b2min',label:'edge \\(x=1\\), minimum:',kind:'number',ans:35/4,tol:1e-4},
  {k:'b2max',label:'edge \\(x=1\\), maximum:',kind:'number',ans:11},
  {k:'b3min',label:'edge \\(y=1\\), minimum:',kind:'number',ans:9},
  {k:'b3max',label:'edge \\(y=1\\), maximum:',kind:'number',ans:11},
  {k:'b4min',label:'edge \\(x=-1\\), minimum:',kind:'number',ans:35/4,tol:1e-4},
  {k:'b4max',label:'edge \\(x=-1\\), maximum:',kind:'number',ans:11},
  {k:'amax',label:'absolute maximum:',kind:'number',ans:11},
  {k:'amin',label:'absolute minimum:',kind:'number',ans:8}],
 solution:'Interior: \\(f_x=2x+2xy=2x(1+y)\\) and \\(f_y=2y+x^2\\). From \\(f_x=0\\), either \\(x=0\\) (then \\(2y=0\\), so \\(y=0\\)) or \\(y=-1\\), which is on the boundary, not the interior. The one interior critical point is \\((0,0)\\) with \\(f=8\\). Edges: on \\(y=-1\\), \\(f=x^2+1-x^2+8=9\\), constant. On \\(x=\\pm1\\), \\(f=y^2+y+9\\) for \\(-1\\le y\\le1\\), a parabola with vertex at \\(y=-\\tfrac12\\): minimum \\(\\tfrac{35}{4}\\), and the maximum is at \\(y=1\\) with value 11 (at \\(y=-1\\) it is 9). On \\(y=1\\), \\(f=2x^2+9\\) for \\(-1\\le x\\le1\\): minimum 9 at \\(x=0\\), maximum 11 at \\(x=\\pm1\\). Compare every candidate: \\(8,\\ 9,\\ \\tfrac{35}{4},\\ 11\\). The absolute maximum is 11 and the absolute minimum is 8.'},
{id:'wa-ext-5',source:'WebAssign: Extrema',hw:'',num:5,module:'06-optimization',chapter:'absolute',status:'wa',
 prompt:'Find the absolute maximum and minimum values of \\(f(x,y)=x^3-3x-y^3+12y+7\\) on the quadrilateral with vertices \\((-2,3)\\), \\((2,3)\\), \\((2,2)\\), \\((-2,-2)\\).',
 parts:[
  {k:'max',label:'absolute maximum:',kind:'number',ans:25},
  {k:'min',label:'absolute minimum:',kind:'number',ans:-11}],
 solution:'Interior: \\(f_x=3x^2-3=0\\) gives \\(x=\\pm1\\) and \\(f_y=-3y^2+12=0\\) gives \\(y=\\pm2\\). Of the four points only \\((1,2)\\) and \\((-1,2)\\) lie inside the quadrilateral (the other two have \\(y=-2\\), below the diagonal \\(y=x\\)), with \\(f(1,2)=21\\) and \\(f(-1,2)=25\\). Edges: top \\(y=3\\): \\(f=x^3-3x+16\\) on \\([-2,2]\\) has candidates \\(f(-2)=14\\), \\(f(2)=18\\), \\(f(1)=14\\), \\(f(-1)=18\\), so it stays between 14 and 18. Right \\(x=2\\), \\(2\\le y\\le3\\): \\(f=-y^3+12y+9\\) is 25 at \\(y=2\\) and 18 at \\(y=3\\). Diagonal \\(y=x\\): \\(f=9x+7\\) runs from \\(-11\\) at \\(x=-2\\) to 25 at \\(x=2\\). Left \\(x=-2\\), \\(-2\\le y\\le3\\): \\(f=-y^3+12y+5\\) gives \\(-11\\) at \\(y=-2\\), 21 at the critical value \\(y=2\\), and 14 at \\(y=3\\). The largest value is 25 (at \\((-1,2)\\) and \\((2,2)\\)) and the smallest is \\(-11\\) (at \\((-2,-2)\\)).'},
{id:'wa-ext-6',source:'WebAssign: Extrema',hw:'',num:6,module:'06-optimization',chapter:'lagrange',status:'wa',
 prompt:'Find the volume of the largest rectangular box in the first octant with three faces in the coordinate planes and one vertex in the plane \\(x+2y+3z=15\\).',
 parts:[{k:'V',label:'\\(V=\\)',kind:'number',ans:125/6,tol:0.005}],
 solution:'The box with vertex \\((x,y,z)\\) has volume \\(V=xyz\\), subject to \\(g=x+2y+3z=15\\). Lagrange: \\(yz=\\lambda\\), \\(xz=2\\lambda\\), \\(xy=3\\lambda\\). Then \\(x=2y\\) and \\(x=3z\\) (divide the equations in pairs), so the three terms \\(x,\\ 2y,\\ 3z\\) are equal, each \\(15/3=5\\). The vertex is \\((5,\\tfrac52,\\tfrac53)\\) and \\(V=5\\cdot\\tfrac52\\cdot\\tfrac53=\\tfrac{125}{6}\\approx 20.83\\). It is a maximum because \\(V\\) is 0 on the boundary of the triangle \\(x,y,z\\ge0\\).'}
);

/* ---------- WebAssign: Constrained Optimization (due 2026-10-05) ---------- */
WA_PROBLEMS.push(
{id:'wa-con-1',source:'WebAssign: Constrained Optimization',hw:'',num:1,module:'06-optimization',chapter:'lagrange',status:'wa',
 prompt:'Use Lagrange multipliers to find the maximum and minimum values of \\(f(x,y)=5xe^{y}\\) subject to the constraint \\(x^2+y^2=2\\). Give each value and the point where it occurs.',
 parts:[
  {k:'max',label:'maximum value:',kind:'number',ans:5*Math.E,tol:0.005},
  {k:'maxpt',label:'at the point:',kind:'vector',ans:[1,1],placeholder:'(x, y)'},
  {k:'min',label:'minimum value:',kind:'number',ans:-5*Math.E,tol:0.005},
  {k:'minpt',label:'at the point:',kind:'vector',ans:[-1,1],placeholder:'(x, y)'}],
 solution:'Set \\(\\nabla f=\\lambda\\nabla g\\) with \\(g=x^2+y^2\\): \\(5e^{y}=2\\lambda x\\) and \\(5xe^{y}=2\\lambda y\\). Neither \\(x\\) nor \\(\\lambda\\) can be 0 (the first equation would read \\(5e^y=0\\)), so divide the second equation by the first: \\(x=y/x\\), that is \\(y=x^2\\). Put that in the constraint: \\(y+y^2=2\\), so \\((y+2)(y-1)=0\\). The root \\(y=-2\\) would need \\(x^2=-2\\), which is impossible, so \\(y=1\\) and \\(x=\\pm1\\). Compare: \\(f(1,1)=5e\\approx13.59\\) is the maximum and \\(f(-1,1)=-5e\\) is the minimum.'},
{id:'wa-con-2',source:'WebAssign: Constrained Optimization',hw:'',num:2,module:'06-optimization',chapter:'absolute',status:'wa',
 prompt:'Find the absolute maximum and minimum values of \\(f(x,y)=2x^2+3y^2-4x-6\\) on the disk \\(x^2+y^2\\le16\\).',
 parts:[
  {k:'max',label:'absolute maximum:',kind:'number',ans:46},
  {k:'maxpt',label:'at the point(s):',kind:'pointList',ans:[[-2,2*Math.sqrt(3)],[-2,-2*Math.sqrt(3)]]},
  {k:'min',label:'absolute minimum:',kind:'number',ans:-8},
  {k:'minpt',label:'at the point:',kind:'vector',ans:[1,0],placeholder:'(x, y)'}],
 solution:'Interior: \\(f_x=4x-4=0\\) and \\(f_y=6y=0\\) give \\((1,0)\\), which is inside the disk, with \\(f=2-4-6=-8\\). Boundary: use \\(y^2=16-x^2\\), so \\(f=2x^2+3(16-x^2)-4x-6=-x^2-4x+42\\) for \\(-4\\le x\\le4\\). This parabola peaks at \\(x=-2\\) with value 46 (there \\(y^2=12\\), so \\(y=\\pm2\\sqrt3\\)), and its ends give \\(f(-4)=42\\) and \\(f(4)=10\\). The absolute maximum is 46 at \\((-2,\\pm2\\sqrt3)\\) and the absolute minimum is \\(-8\\) at \\((1,0)\\).'},
{id:'wa-con-3',source:'WebAssign: Constrained Optimization',hw:'',num:3,module:'06-optimization',chapter:'lagrange',status:'wa',
 prompt:'The US Postal Service will accept a box for domestic shipping only if the sum of its length and girth (the perimeter of a cross-section perpendicular to the length) is at most 114 inches. Find the dimensions of the largest-volume rectangular box that can be mailed. Take the length \\(\\ell\\) as the long side and a cross-section of width \\(w\\) and height \\(h\\).',
 parts:[
  {k:'l',label:'length \\(\\ell\\) (in):',kind:'number',ans:38,tol:0.005},
  {k:'w',label:'width \\(w\\) (in):',kind:'number',ans:19,tol:0.005},
  {k:'h',label:'height \\(h\\) (in):',kind:'number',ans:19,tol:0.005}],
 solution:'Maximize \\(V=\\ell wh\\) subject to \\(\\ell+2w+2h=114\\) (the girth is \\(2w+2h\\)); the largest box uses the full limit. Lagrange: \\(wh=\\lambda\\), \\(\\ell h=2\\lambda\\), \\(\\ell w=2\\lambda\\). The first two give \\(\\ell=2w\\), the first and third give \\(\\ell=2h\\), so \\(w=h=\\ell/2\\). Then \\(\\ell+2(\\ell/2)+2(\\ell/2)=3\\ell=114\\), so \\(\\ell=38\\) and \\(w=h=19\\). The volume is \\(38\\cdot19\\cdot19=13718\\) cubic inches.'},
{id:'wa-con-4',source:'WebAssign: Constrained Optimization',hw:'',num:4,module:'06-optimization',chapter:'absolute',status:'wa',
 prompt:'Find the absolute maximum and minimum values of \\(f(x,y)=e^{-xy}\\) on the region \\(x^2+4y^2\\le1\\). Give decimals to four places or exact values.',
 parts:[
  {k:'max',label:'absolute maximum:',kind:'number',ans:Math.exp(0.25),tol:1e-4},
  {k:'min',label:'absolute minimum:',kind:'number',ans:Math.exp(-0.25),tol:1e-4}],
 solution:'Interior: \\(f_x=-ye^{-xy}\\) and \\(f_y=-xe^{-xy}\\) vanish only at \\((0,0)\\), where \\(f=1\\). Boundary: the ellipse \\(x^2+4y^2=1\\) is \\(x=\\cos t\\), \\(y=\\tfrac12\\sin t\\), so \\(xy=\\tfrac14\\sin2t\\) takes every value in \\([-\\tfrac14,\\tfrac14]\\). Since \\(e^{-u}\\) is decreasing, \\(f=e^{-xy}\\) runs from \\(e^{-1/4}\\) (when \\(xy=\\tfrac14\\)) to \\(e^{1/4}\\) (when \\(xy=-\\tfrac14\\)). Compare with the interior value 1: the absolute maximum is \\(e^{1/4}\\approx1.2840\\) and the absolute minimum is \\(e^{-1/4}\\approx0.7788\\).'}
);

/* ---------- WebAssign: Rectangular Integrals (due 2026-10-05) ---------- */
WA_PROBLEMS.push(
{id:'wa-rect-1',source:'WebAssign: Rectangular Integrals',hw:'',num:1,module:'06-optimization',chapter:'lagrange',status:'wa',
 prompt:'Find the points on the surface \\(y^2=64+xz\\) that are closest to the origin. Enter the point with the smaller \\(y\\)-value first.',
 parts:[
  {k:'lo',label:'point with the smaller \\(y\\)-value:',kind:'vector',ans:[0,-8,0],placeholder:'(x, y, z)'},
  {k:'hi',label:'point with the larger \\(y\\)-value:',kind:'vector',ans:[0,8,0],placeholder:'(x, y, z)'}],
 solution:'Minimize the squared distance \\(f=x^2+y^2+z^2\\) subject to \\(g=y^2-xz=64\\). Lagrange: \\(2x=-\\lambda z\\), \\(2y=2\\lambda y\\), \\(2z=-\\lambda x\\). If \\(y\\ne0\\), the middle equation gives \\(\\lambda=1\\), so \\(2x=-z\\) and \\(2z=-x\\); together \\(4x=x\\), which forces \\(x=0\\) and \\(z=0\\). Then \\(y^2=64\\), so \\(y=\\pm8\\) and \\(f=64\\). If \\(y=0\\), the constraint says \\(xz=-64\\), and \\(x^2+z^2\\ge2|xz|=128\\), which is farther. The closest points are \\((0,-8,0)\\) and \\((0,8,0)\\), at distance 8.'},
{id:'wa-rect-2',source:'WebAssign: Rectangular Integrals',hw:'',num:2,module:'07-double-integrals',chapter:'rect',status:'wa',
 prompt:'Estimate the volume of the solid under the surface \\(z=xy\\) and above the rectangle \\(R=[7,13]\\times[3,7]\\). Divide \\(R\\) into \\(m=3\\) subintervals in \\(x\\) and \\(n=2\\) in \\(y\\) (six equal sub-rectangles).',
 parts:[
  {k:'dx',label:'\\(\\Delta x=\\)',kind:'number',ans:2},
  {k:'dy',label:'\\(\\Delta y=\\)',kind:'number',ans:2},
  {k:'dA',label:'\\(\\Delta A=\\)',kind:'number',ans:4},
  {k:'ur',label:'(a) Riemann sum using upper right corners:',kind:'number',ans:1584},
  {k:'mid',label:'(b) Midpoint rule:',kind:'number',ans:1200}],
 solution:'The widths are \\(\\Delta x=(13-7)/3=2\\) and \\(\\Delta y=(7-3)/2=2\\), so \\(\\Delta A=4\\). Because \\(xy\\) is a product, the sum factors into an \\(x\\)-sum times a \\(y\\)-sum. (a) Upper right corners have \\(x\\in\\{9,11,13\\}\\) and \\(y\\in\\{5,7\\}\\): \\((9+11+13)(5+7)\\cdot4=33\\cdot12\\cdot4=1584\\). (b) Midpoints have \\(x\\in\\{8,10,12\\}\\) and \\(y\\in\\{4,6\\}\\): \\((8+10+12)(4+6)\\cdot4=30\\cdot10\\cdot4=1200\\). The midpoint answer equals the exact integral \\(\\int_7^{13}x\\,dx\\int_3^7y\\,dy=60\\cdot20\\) because \\(xy\\) is linear in each variable, so the midpoint rule has no error here. The corner sum overestimates since \\(xy\\) is increasing.'},
{id:'wa-rect-3',source:'WebAssign: Rectangular Integrals',hw:'',num:3,module:'07-double-integrals',chapter:'rect',status:'wa',
 prompt:'Evaluate the iterated integral \\(\\displaystyle\\int_1^2\\int_0^4 (6x^2y-4x)\\,dy\\,dx\\).',
 parts:[{k:'I',label:'value:',kind:'number',ans:88}],
 solution:'Inner integral in \\(y\\), holding \\(x\\) fixed: \\(\\int_0^4(6x^2y-4x)\\,dy=\\left[3x^2y^2-4xy\\right]_0^4=48x^2-16x\\). Outer integral: \\(\\int_1^2(48x^2-16x)\\,dx=\\left[16x^3-8x^2\\right]_1^2=(128-32)-(16-8)=88\\).'},
{id:'wa-rect-4',source:'WebAssign: Rectangular Integrals',hw:'',num:4,module:'07-double-integrals',chapter:'rect',status:'wa',
 prompt:'Evaluate \\(\\displaystyle\\iint_R \\frac{3xy^2}{x^2+1}\\,dA\\) where \\(R=\\{(x,y):0\\le x\\le3,\\ -2\\le y\\le2\\}\\). Exact (like \\(5\\ln 2\\)) or a decimal to three places.',
 parts:[{k:'I',label:'value:',kind:'number',ans:8*Math.log(10),tol:0.005}],
 solution:'The integrand is a function of \\(x\\) times a function of \\(y\\) over a rectangle, so the integral splits: \\(3\\int_0^3\\frac{x}{x^2+1}\\,dx\\cdot\\int_{-2}^2y^2\\,dy\\). The first factor is \\(\\left[\\tfrac12\\ln(x^2+1)\\right]_0^3=\\tfrac12\\ln10\\). The second is \\(\\left[\\tfrac{y^3}{3}\\right]_{-2}^2=\\tfrac{16}{3}\\). Multiply: \\(3\\cdot\\tfrac12\\ln10\\cdot\\tfrac{16}{3}=8\\ln10\\approx18.421\\).'},
{id:'wa-rect-5',source:'WebAssign: Rectangular Integrals',hw:'',num:5,module:'07-double-integrals',chapter:'rect',status:'wa',
 prompt:'Find the volume of the solid lying under the surface \\(z=x^2+xy^2\\) and above the rectangle \\(0\\le x\\le5\\), \\(-4\\le y\\le4\\). Exact or a decimal to three places.',
 parts:[{k:'V',label:'\\(V=\\)',kind:'number',ans:2600/3,tol:0.005}],
 solution:'The height is nonnegative on the rectangle, so \\(V=\\int_0^5\\int_{-4}^4(x^2+xy^2)\\,dy\\,dx\\). Inner: \\(\\left[x^2y+\\tfrac{xy^3}{3}\\right]_{-4}^4=8x^2+\\tfrac{128}{3}x\\). Outer: \\(\\left[\\tfrac{8x^3}{3}+\\tfrac{64x^2}{3}\\right]_0^5=\\tfrac{1000}{3}+\\tfrac{1600}{3}=\\tfrac{2600}{3}\\approx866.667\\).'}
);

/* ---------- After Midterm 2: Week 12 HW (due 2026-11-13, extension to 11-15) and the WebAssign sets due 2026-11-09 to 11-18 ----------
   Problem 1 of Week 12 HW and the figure-only WebAssign items (FTLI 1 and 5, the "select the figure" parts) are left out: they need the picture. */
(function(){
const R=String.raw;
const W12='Week 12 HW',FTLI='WebAssign: Fundamental Theorem for Line Integrals',GR='WebAssign: Green\'s Theorem',MGR='WebAssign: More Green\'s Theorem',
      PS='WebAssign: Parametric Surfaces',MPS='WebAssign: More Parametric Surfaces',SSI='WebAssign: Scalar Surface Integrals';
WA_PROBLEMS.push(
/* ----- Week 12 HW ----- */
{id:'hw12-2',source:W12,hw:'',num:2,module:'09-line-integrals',chapter:'ftc',status:'hw',
 prompt:R`Let \(\mathbf{F}(x,y)=\langle e^{2x}+y^2,\ \sin(y^3)+2xy\rangle\). (a) Is \(\mathbf{F}\) conservative? (b) Find \(\int_C\mathbf{F}\cdot d\mathbf{r}\), where \(C\) goes along a straight line from \((0,0)\) to \((3,-4)\), and then travels clockwise along the circle of radius 5 centered at the origin to \((5,0)\). Exact answers like <code>(e^10-1)/2</code> are fine.`,
 parts:[{k:'a',label:R`(a) Is \(\mathbf{F}\) conservative?`,kind:'choice',options:['Yes','No'],ans:0},
  {k:'I',label:R`(b) \(\int_C\mathbf{F}\cdot d\mathbf{r}=\)`,kind:'number',ans:(Math.exp(10)-1)/2}],
 solution:R`(a) \(P_y=2y\) and \(Q_x=2y\), and \(\mathbf{F}\) is smooth on all of \(\mathbb{R}^2\), so yes. (b) Integrate \(P\) in \(x\): \(f=\tfrac12e^{2x}+xy^2+g(y)\). Then \(f_y=2xy+g'(y)=\sin(y^3)+2xy\) gives \(g'(y)=\sin(y^3)\), which has no elementary antiderivative, so write \(g(y)=\int_0^y\sin(t^3)\,dt\). The path is irrelevant: \(\int_C\mathbf{F}\cdot d\mathbf{r}=f(5,0)-f(0,0)\). Both endpoints have \(y=0\), so the integral term is 0 at each end, and the answer is \(\tfrac12e^{10}-\tfrac12\approx 11012.73\).`},
{id:'hw12-3',source:W12,hw:'',num:3,module:'09-line-integrals',chapter:'ftc',status:'hw',
 prompt:R`Let \(\mathbf{G}(x,y)=\dfrac{1}{x^2+y^2}\langle x,\ y\rangle\). (a) Show that the scalar curl of \(\mathbf{G}\) is zero at every point where \(\mathbf{G}\) is defined. (b) Solely from the result in part (a), can we conclude that \(\mathbf{G}\) is conservative? (c) Is \(\mathbf{G}\) actually conservative? If so, give a potential.`,
 parts:[{k:'c',label:R`(a) \(Q_x-P_y=\)`,kind:'number',ans:0},
  {k:'b',label:'(b) From (a) alone:',kind:'choice',options:['Yes, zero curl proves it','No, the domain has a hole at the origin, so the test is inconclusive'],ans:1},
  {k:'d',label:'(c) Is G conservative?',kind:'choice',options:['Yes','No'],ans:0},
  {k:'f',label:R`(c) potential \(f(x,y)=\)`,kind:'constant',ans:'ln(x^2+y^2)/2',vars:['x','y'],domain:{x:[0.5,2],y:[0.5,2]}}],
 solution:R`(a) \(Q_x=\dfrac{-2xy}{(x^2+y^2)^2}\) and \(P_y=\dfrac{-2xy}{(x^2+y^2)^2}\), so \(Q_x-P_y=0\) away from the origin. (b) No. \(\mathbf{G}\) is undefined at the origin, so its domain is not simply connected and the test only says "maybe": the field \(\frac{1}{x^2+y^2}\langle -y,x\rangle\) also has zero curl there and is <b>not</b> conservative. (c) Yes. \(\tfrac{\partial}{\partial x}\tfrac12\ln(x^2+y^2)=\tfrac{x}{x^2+y^2}\) and likewise for \(y\), so \(\mathbf{G}=\nabla\left(\tfrac12\ln(x^2+y^2)\right)\) on the whole punctured plane. Check: around the unit circle \(\mathbf{G}\) is perpendicular to the path, so the loop integral is 0, as it must be.`},
{id:'hw12-4',source:W12,hw:'',num:4,module:'10-greens-surfaces',chapter:'green',status:'hw',
 prompt:R`Let \(H\) be the regular hexagon with two vertices at \((\pm1,0)\) and four vertices at \(\left(\pm\tfrac12,\pm\tfrac{\sqrt3}{2}\right)\). Let \(C\) be the path that goes from \(\left(\tfrac12,\tfrac{\sqrt3}{2}\right)\) around five edges of the hexagon to \(\left(-\tfrac12,\tfrac{\sqrt3}{2}\right)\). Let \(\mathbf{F}(x,y)=\left\langle 5e^x+\left(y-\tfrac{\sqrt3}{2}\right)\tan^2x,\ \ \tan x+\ln(y+3)\right\rangle\). Find \(\int_C\mathbf{F}\cdot d\mathbf{r}\), calculating as few integrals as possible. (A trig identity relating \(\sec^2 a\) and \(\tan^2 a\) may come in handy.)`,
 parts:[{k:'c',label:R`\(Q_x-P_y=\)`,kind:'number',ans:1},
  {k:'I',label:R`\(\int_C\mathbf{F}\cdot d\mathbf{r}=\)`,kind:'number',ans:-3*Math.sqrt(3)/2-5*(Math.exp(0.5)-Math.exp(-0.5))}],
 solution:R`\(Q_x-P_y=\sec^2x-\tan^2x=1\). Close the path with the top edge \(L\) from \(\left(-\tfrac12,\tfrac{\sqrt3}{2}\right)\) to \(\left(\tfrac12,\tfrac{\sqrt3}{2}\right)\). Watch the direction: from \(\left(\tfrac12,\tfrac{\sqrt3}{2}\right)\) the five edges go down to \((1,0)\) first, so \(C\) then \(L\) runs <b>clockwise</b>, and Green's theorem gives \(-1\cdot\text{area}(H)=-\tfrac{3\sqrt3}{2}\) (six equilateral triangles of side 1). On \(L\), \(y=\tfrac{\sqrt3}{2}\) and \(dy=0\), so the \(\tan^2x\) term vanishes and \(\int_L\mathbf{F}\cdot d\mathbf{r}=\int_{-1/2}^{1/2}5e^x\,dx=5\left(e^{1/2}-e^{-1/2}\right)\). Therefore \(\int_C\mathbf{F}\cdot d\mathbf{r}=-\tfrac{3\sqrt3}{2}-5\left(e^{1/2}-e^{-1/2}\right)\approx-7.809\).`},

/* ----- WebAssign: Fundamental Theorem for Line Integrals (due 2026-11-09) ----- */
{id:'wa-ftli-2',source:FTLI,hw:'',num:2,module:'09-line-integrals',chapter:'ftc',status:'wa',
 prompt:R`Consider \(\mathbf{F}(x,y)=\langle 2x,\ 4y\rangle\) and \(C\), the arc of the parabola \(x=y^2\) from \((9,-3)\) to \((1,1)\). (a) Find a function \(f\) such that \(\mathbf{F}=\nabla f\). (b) Use part (a) to evaluate \(\int_C\mathbf{F}\cdot d\mathbf{r}\).`,
 parts:[{k:'f',label:R`(a) \(f(x,y)=\)`,kind:'constant',ans:'x^2+2y^2',vars:['x','y']},
  {k:'I',label:R`(b) \(\int_C\mathbf{F}\cdot d\mathbf{r}=\)`,kind:'number',ans:-96}],
 solution:R`\(f=x^2+2y^2\) works: \(f_x=2x\), \(f_y=4y\). Then \(\int_C\mathbf{F}\cdot d\mathbf{r}=f(1,1)-f(9,-3)=3-(81+18)=-96\). The parabola never enters the computation.`},
{id:'wa-ftli-3',source:FTLI,hw:'',num:3,module:'09-line-integrals',chapter:'ftc',status:'wa',
 prompt:R`Find the work done by the force field \(\mathbf{F}(x,y)=x^5\,\mathbf{i}+y^5\,\mathbf{j}\) in moving an object from \(P(1,0)\) to \(Q(3,3)\).`,
 parts:[{k:'W',label:R`\(W=\)`,kind:'number',ans:1457/6}],
 solution:R`\(\mathbf{F}=\nabla f\) with \(f=\tfrac{x^6}{6}+\tfrac{y^6}{6}\). So \(W=f(3,3)-f(1,0)=\tfrac{729+729}{6}-\tfrac16=\tfrac{1457}{6}\approx 242.83\).`},
{id:'wa-ftli-4',source:FTLI,hw:'',num:4,module:'09-line-integrals',chapter:'ftc',status:'wa',
 prompt:R`Consider \(\mathbf{F}(x,y,z)=(y^2z+2xz^2)\,\mathbf{i}+2xyz\,\mathbf{j}+(xy^2+2x^2z)\,\mathbf{k}\) and \(C:\ x=\sqrt t,\ y=t+5,\ z=t^2,\ 0\le t\le1\). (a) Find a function \(f\) such that \(\mathbf{F}=\nabla f\). (b) Use part (a) to evaluate \(\int_C\mathbf{F}\cdot d\mathbf{r}\).`,
 parts:[{k:'f',label:R`(a) \(f(x,y,z)=\)`,kind:'constant',ans:'x*y^2*z+x^2*z^2',vars:['x','y','z']},
  {k:'I',label:R`(b) \(\int_C\mathbf{F}\cdot d\mathbf{r}=\)`,kind:'number',ans:37}],
 solution:R`Integrate \(P\) in \(x\): \(f=xy^2z+x^2z^2+g(y,z)\). Then \(f_y=2xyz\) and \(f_z=xy^2+2x^2z\) already match, so \(g\) is constant: \(f=xy^2z+x^2z^2\). The curve runs from \(\mathbf{r}(0)=(0,5,0)\) to \(\mathbf{r}(1)=(1,6,1)\), so the integral is \(f(1,6,1)-f(0,5,0)=36+1-0=37\).`},
{id:'wa-ftli-6',source:FTLI,hw:'',num:6,module:'09-line-integrals',chapter:'vector',status:'wa',
 prompt:R`Evaluate \(\int_C y\,dx+z\,dy+x\,dz\), where \(C:\ x=\sqrt t,\ y=t,\ z=t^2,\ 1\le t\le16\).`,
 parts:[{k:'I',label:R`\(\int_C=\)`,kind:'number',ans:11022/5}],
 solution:R`\(dx=\tfrac{1}{2\sqrt t}dt\), \(dy=dt\), \(dz=2t\,dt\). The integrand becomes \(\tfrac{t}{2\sqrt t}+t^2+\sqrt t\cdot 2t=\tfrac12t^{1/2}+t^2+2t^{3/2}\). Integrate from 1 to 16: \(\tfrac13\left(64-1\right)+\tfrac13\left(4096-1\right)+\tfrac45\left(1024-1\right)=21+1365+818.4=2204.4=\tfrac{11022}{5}\). This field is not conservative (\(\operatorname{curl}\langle y,z,x\rangle=\langle -1,-1,-1\rangle\)), so you do have to parametrize.`},

/* ----- WebAssign: Green's Theorem (due 2026-11-11) ----- */
{id:'wa-green-1',source:GR,hw:'',num:1,module:'10-greens-surfaces',chapter:'green',status:'wa',
 prompt:R`Calculate \(\oint_C\mathbf{F}\cdot d\mathbf{r}\), where \(\mathbf{F}(x,y)=\langle x^2+y,\ 8x-y^3\rangle\) and \(C\) is the positively oriented boundary curve of a region \(D\) that has area 5.`,
 parts:[{k:'I',label:R`\(\oint_C\mathbf{F}\cdot d\mathbf{r}=\)`,kind:'number',ans:35}],
 solution:R`\(Q_x-P_y=8-1=7\), a constant, so Green's theorem gives \(7\cdot\text{area}(D)=7\cdot5=35\). You never need to know what \(D\) looks like.`},
{id:'wa-green-2',source:GR,hw:'',num:2,module:'10-greens-surfaces',chapter:'green',status:'wa',
 prompt:R`Use Green's theorem to evaluate \(\oint_C ye^x\,dx+2e^x\,dy\), where \(C\) is the rectangle with vertices \((0,0),(6,0),(6,2),(0,2)\), positively oriented.`,
 parts:[{k:'I',label:R`\(\oint_C=\)`,kind:'number',ans:2*Math.exp(6)-2}],
 solution:R`\(Q_x-P_y=2e^x-e^x=e^x\). So the integral is \(\int_0^6\int_0^2e^x\,dy\,dx=2\left(e^6-1\right)=2e^6-2\approx 804.86\).`},
{id:'wa-green-3',source:GR,hw:'',num:3,module:'10-greens-surfaces',chapter:'green',status:'wa',
 prompt:R`Use Green's theorem to evaluate \(\int_C\left(3+e^{x^2}\right)dx+\left(\tan^{-1}y+3x^2\right)dy\), where \(C\) is the boundary of the region in the first quadrant between the circles \(x^2+y^2=4\) and \(x^2+y^2=9\): along the \(x\)-axis from \((2,0)\) to \((3,0)\), counterclockwise along the outer circle to \((0,3)\), down the \(y\)-axis to \((0,2)\), then clockwise along the inner circle back to \((2,0)\). (The WebAssign version shows this in a figure; check the orientation before applying the theorem.)`,
 parts:[{k:'I',label:R`\(\int_C=\)`,kind:'number',ans:38}],
 solution:R`The region stays on your left the whole way around, so \(C\) is positively oriented. \(Q_x-P_y=6x-0=6x\). In polar coordinates over \(2\le r\le3\), \(0\le\theta\le\tfrac\pi2\): \(\int_0^{\pi/2}\int_2^3 6r\cos\theta\cdot r\,dr\,d\theta=6\cdot[\sin\theta]_0^{\pi/2}\cdot\tfrac{27-8}{3}=38\).`},
{id:'wa-green-4',source:GR,hw:'',num:4,module:'10-greens-surfaces',chapter:'green',status:'wa',
 prompt:R`Use Green's theorem to find the work done by the force \(\mathbf{F}(x,y)=x(x+y)\,\mathbf{i}+xy^2\,\mathbf{j}\) in moving a particle from the origin along the \(x\)-axis to \((3,0)\), then along the line segment to \((0,3)\), and then back to the origin along the \(y\)-axis.`,
 parts:[{k:'W',label:R`\(W=\)`,kind:'number',ans:9/4}],
 solution:R`The path is counterclockwise around the triangle \(T\) with vertices \((0,0),(3,0),(0,3)\). \(Q_x-P_y=y^2-x\). So \(W=\int_0^3\int_0^{3-x}(y^2-x)\,dy\,dx=\int_0^3\left[\tfrac{(3-x)^3}{3}-x(3-x)\right]dx=\tfrac{27}{4}-\tfrac92=\tfrac94\).`},

/* ----- WebAssign: More Green's Theorem (due 2026-11-13) ----- */
{id:'wa-mgreen-1',source:MGR,hw:'',num:1,module:'10-greens-surfaces',chapter:'green',status:'wa',
 prompt:R`Evaluate \(\int_C\mathbf{F}\cdot d\mathbf{r}\) for \(\mathbf{F}(x,y)=\langle y\cos x-xy\sin x,\ xy+x\cos x\rangle\), where \(C\) is the triangle from \((0,0)\) to \((0,6)\) to \((2,0)\) to \((0,0)\).`,
 parts:[{k:'I',label:R`\(\int_C\mathbf{F}\cdot d\mathbf{r}=\)`,kind:'number',ans:-12}],
 solution:R`\(Q_x=y+\cos x-x\sin x\) and \(P_y=\cos x-x\sin x\), so \(Q_x-P_y=y\). The path goes up the \(y\)-axis first, which puts the triangle on your right: it is <b>clockwise</b>. For the triangle with legs 2 (along \(x\)) and 6 (along \(y\)), \(\iint y\,dA=\tfrac{ab^2}{6}=\tfrac{2\cdot36}{6}=12\). With the clockwise sign the answer is \(-12\).`},
{id:'wa-mgreen-2',source:MGR,hw:'',num:2,module:'10-greens-surfaces',chapter:'green',status:'wa',
 prompt:R`Evaluate \(\int_C\mathbf{F}\cdot d\mathbf{r}\) for \(\mathbf{F}(x,y)=\langle e^{-x}+y^2,\ e^{-y}+x^2\rangle\), where \(C\) consists of the arc of the curve \(y=\cos x\) from \(\left(-\tfrac\pi2,0\right)\) to \(\left(\tfrac\pi2,0\right)\) and the line segment from \(\left(\tfrac\pi2,0\right)\) to \(\left(-\tfrac\pi2,0\right)\).`,
 parts:[{k:'I',label:R`\(\int_C\mathbf{F}\cdot d\mathbf{r}=\)`,kind:'number',ans:Math.PI/2}],
 solution:R`\(Q_x-P_y=2x-2y\). The arc runs left to right over the top and the segment comes back along the \(x\)-axis, so the region is on your right: <b>clockwise</b>. Over \(D:\ -\tfrac\pi2\le x\le\tfrac\pi2,\ 0\le y\le\cos x\), \(\iint 2x\,dA=0\) by symmetry and \(\iint -2y\,dA=-\int_{-\pi/2}^{\pi/2}\cos^2x\,dx=-\tfrac\pi2\). The clockwise sign flips it: \(\tfrac\pi2\).`},

/* ----- WebAssign: Parametric Surfaces (due 2026-11-16) ----- */
{id:'wa-psurf-1',source:PS,hw:'',num:1,module:'10-greens-surfaces',chapter:'param',status:'wa',
 prompt:R`Find a parametric representation for the plane that passes through the point \((0,-1,6)\) and contains the vectors \(\langle 2,1,3\rangle\) and \(\langle -4,2,6\rangle\). Use \(u\) for the first vector and \(v\) for the second, and enter \(\langle x,y,z\rangle\).`,
 parts:[{k:'r',label:R`\(\mathbf{r}(u,v)=\)`,kind:'exprVector',ans:['2u-4v','-1+u+2v','6+3u+6v'],vars:['u','v']}],
 solution:R`\(\mathbf{r}=\mathbf{p}+u\mathbf{a}+v\mathbf{b}=\langle 0,-1,6\rangle+u\langle 2,1,3\rangle+v\langle -4,2,6\rangle\), so \(x=2u-4v\), \(y=-1+u+2v\), \(z=6+3u+6v\).`},
{id:'wa-psurf-2',source:PS,hw:'',num:2,module:'10-greens-surfaces',chapter:'param',status:'wa',
 prompt:R`Find a parametric representation for the part of the cylinder \(x^2+z^2=16\) that lies above the \(xy\)-plane and between the planes \(y=-5\) and \(y=5\), with \(-5\le u\le5\) and \(0\le v\le\pi\). Enter \(\langle x,y,z\rangle\) with the angle \(v\) measured from the positive \(x\)-axis.`,
 parts:[{k:'r',label:R`\(\mathbf{r}(u,v)=\)`,kind:'exprVector',ans:['4cos(v)','u','4sin(v)'],vars:['u','v']}],
 solution:R`The cylinder's axis is the \(y\)-axis, so the circle lives in \(x\) and \(z\): \(x=4\cos v\), \(z=4\sin v\), and \(y=u\) runs along the axis. "Above the \(xy\)-plane" means \(z\ge0\), which is \(0\le v\le\pi\).`},
{id:'wa-psurf-3',source:PS,hw:'',num:3,module:'10-greens-surfaces',chapter:'param',status:'wa',
 prompt:R`Describe the grid curves of \(\mathbf{r}(u,v)=u\cos v\,\mathbf{i}+u\sin v\,\mathbf{j}+v\,\mathbf{k}\). (The WebAssign version also asks you to pick its graph: a spiral ramp.)`,
 parts:[{k:'u',label:R`\(u\) constant:`,kind:'choice',options:['each grid curve is a circle in a horizontal plane','each grid curve is a helix','each grid curve is a vertically oriented circle'],ans:1},
  {k:'v',label:R`\(v\) constant:`,kind:'choice',options:['a vertical line parallel to the \\(z\\)-axis','a helix','a straight line in the plane \\(z=v\\) which intersects the \\(z\\)-axis'],ans:2}],
 solution:R`Fix \(u\): \(\langle u\cos v,u\sin v,v\rangle\) circles the \(z\)-axis at radius \(|u|\) while rising, a helix. Fix \(v\): \(\langle u\cos v,u\sin v,v\rangle\) is a line through \((0,0,v)\) in the direction \(\langle\cos v,\sin v,0\rangle\), horizontal at height \(z=v\). Together they sweep out a helicoid.`},
{id:'wa-psurf-4',source:PS,hw:'',num:4,module:'10-greens-surfaces',chapter:'param',status:'wa',
 prompt:R`Describe the grid curves of \(\mathbf{r}(u,v)=uv^2\,\mathbf{i}+u^2v\,\mathbf{j}+(u^2-v^2)\,\mathbf{k}\).`,
 parts:[{k:'u',label:R`\(u\) constant:`,kind:'choice',options:['each grid curve is a circle of radius \\(|u|\\)','each grid curve lies in the plane \\(z=u^2-x/u\\)','each grid curve is a helix'],ans:1},
  {k:'v',label:R`\(v\) constant:`,kind:'choice',options:['each grid curve lies in the plane \\(z=y/v-v^2\\)','each grid curve is a vertical line','each grid curve lies in the vertical plane \\(y=kx\\)'],ans:0}],
 solution:R`Fix \(u\): \(x=uv^2\) gives \(v^2=x/u\), so \(z=u^2-v^2=u^2-x/u\), a linear equation in \(x\) and \(z\): the curve lies in a plane. Fix \(v\): \(y=u^2v\) gives \(u^2=y/v\), so \(z=y/v-v^2\), again a plane.`},
{id:'wa-psurf-5',source:PS,hw:'',num:5,module:'10-greens-surfaces',chapter:'param',status:'wa',
 prompt:R`Describe the grid curves of \(x=(1-u)(3+\cos v)\cos(4\pi u)\), \(y=(1-u)(3+\cos v)\sin(4\pi u)\), \(z=3u+(1-u)\sin v\).`,
 parts:[{k:'u',label:R`\(u\) constant:`,kind:'choice',options:['each grid curve is a helix','each grid curve is a circle in a horizontal plane','each grid curve is a vertically oriented circle'],ans:2},
  {k:'v',label:R`\(v\) constant:`,kind:'choice',options:['the grid curves are spiral curves','each grid curve is a straight line','each grid curve lies in a vertical plane through the \\(z\\)-axis'],ans:0}],
 solution:R`Fix \(u\): the point sits at angle \(4\pi u\) around the \(z\)-axis, at distance \((1-u)(3+\cos v)\) from it and height \(3u+(1-u)\sin v\). As \(v\) runs, that traces a circle of radius \(1-u\) centered at distance \(3(1-u)\), height \(3u\), in a vertical plane: a vertically oriented circle. Fix \(v\): as \(u\) runs the angle \(4\pi u\) turns twice while the distance shrinks and the height rises, a spiral. The surface is a shrinking spiral tube.`},

/* ----- WebAssign: More Parametric Surfaces (due 2026-11-16) ----- */
{id:'wa-mpsurf-1',source:MPS,hw:'',num:1,module:'10-greens-surfaces',chapter:'param',status:'wa',
 prompt:R`Find a (non-parametric) equation of the tangent plane to the parametric surface \(\mathbf{r}(u,v)=(1-u^2-v^2)\,\mathbf{i}-v\,\mathbf{j}-u\,\mathbf{k}\) at the point \((-1,-1,-1)\).`,
 parts:[{k:'E',label:'equation:',kind:'equation',ans:e=>e.x-2*e.y-2*e.z-3,eq:'x-2y-2z=3',vars:['x','y','z'],xwide:true,placeholder:'ax + by + cz = d'}],
 solution:R`\(-v=-1\) and \(-u=-1\) give \(u=v=1\). \(\mathbf{r}_u=\langle -2u,0,-1\rangle=\langle -2,0,-1\rangle\), \(\mathbf{r}_v=\langle -2v,-1,0\rangle=\langle -2,-1,0\rangle\), so \(\mathbf{r}_u\times\mathbf{r}_v=\langle -1,2,2\rangle\). The plane: \(-(x+1)+2(y+1)+2(z+1)=0\), that is \(x-2y-2z=3\). Check: the surface is \(x=1-y^2-z^2\), and \(\nabla(x+y^2+z^2)=\langle 1,-2,-2\rangle\) at the point, the same normal.`},
{id:'wa-mpsurf-2',source:MPS,hw:'',num:2,module:'10-greens-surfaces',chapter:'param',status:'wa',
 prompt:R`Find parametric equations for the surface obtained by rotating the curve \(y=\dfrac{1}{5+x^2}\), \(-2\le x\le2\), about the \(x\)-axis, with \(-2\le u\le2\) and \(0\le v\le2\pi\). Enter \(\langle x,y,z\rangle\), with \(y\) using \(\cos v\) and \(z\) using \(\sin v\).`,
 parts:[{k:'r',label:R`\(\mathbf{r}(u,v)=\)`,kind:'exprVector',ans:['u','cos(v)/(5+u^2)','sin(v)/(5+u^2)'],vars:['u','v']}],
 solution:R`Each point \((u,f(u))\) of the curve sweeps a circle of radius \(f(u)\) about the \(x\)-axis: \(x=u\), \(y=f(u)\cos v\), \(z=f(u)\sin v\) with \(f(u)=\tfrac{1}{5+u^2}\).`},
{id:'wa-mpsurf-3',source:MPS,hw:'',num:3,module:'10-greens-surfaces',chapter:'param',status:'wa',
 prompt:R`Find a non-parametric equation of the tangent plane to the surface \(x=u+v,\ y=9u^2,\ z=u-v\) at the point \((2,9,0)\).`,
 parts:[{k:'E',label:'equation:',kind:'equation',ans:e=>9*e.x-e.y+9*e.z-9,eq:'9x-y+9z=9',vars:['x','y','z'],xwide:true,placeholder:'ax + by + cz = d'}],
 solution:R`\(u+v=2\) and \(u-v=0\) give \(u=v=1\) (and \(y=9\) checks). \(\mathbf{r}_u=\langle 1,18u,1\rangle=\langle 1,18,1\rangle\), \(\mathbf{r}_v=\langle 1,0,-1\rangle\), so \(\mathbf{r}_u\times\mathbf{r}_v=\langle -18,2,-18\rangle\), parallel to \(\langle 9,-1,9\rangle\). The plane: \(9(x-2)-(y-9)+9z=0\), that is \(9x-y+9z=9\).`},

/* ----- WebAssign: Scalar Surface Integrals (due 2026-11-18) ----- */
{id:'wa-ssi-1',source:SSI,hw:'',num:1,module:'10-greens-surfaces',chapter:'param',status:'wa',
 prompt:R`Find the area of the part of the surface \(z=xy\) that lies within the cylinder \(x^2+y^2=64\).`,
 parts:[{k:'A',label:R`\(A=\)`,kind:'number',ans:2*Math.PI/3*(Math.pow(65,1.5)-1)}],
 solution:R`\(A=\iint_D\sqrt{1+z_x^2+z_y^2}\,dA=\iint_D\sqrt{1+x^2+y^2}\,dA\) over the disk of radius 8. In polar: \(\int_0^{2\pi}\int_0^8\sqrt{1+r^2}\,r\,dr\,d\theta=2\pi\cdot\tfrac13\left[(1+r^2)^{3/2}\right]_0^8=\tfrac{2\pi}{3}\left(65\sqrt{65}-1\right)\approx 1095.0\).`},
{id:'wa-ssi-2',source:SSI,hw:'',num:2,module:'10-greens-surfaces',chapter:'scalar',status:'wa',
 prompt:R`Evaluate \(\iint_S y\,dS\), where \(S\) is the helicoid \(\mathbf{r}(u,v)=\langle u\cos v,\ u\sin v,\ v\rangle\), \(0\le u\le2\), \(0\le v\le\pi\).`,
 parts:[{k:'I',label:R`\(\iint_S y\,dS=\)`,kind:'number',ans:2/3*(5*Math.sqrt(5)-1)}],
 solution:R`\(\mathbf{r}_u=\langle\cos v,\sin v,0\rangle\), \(\mathbf{r}_v=\langle -u\sin v,u\cos v,1\rangle\), \(\mathbf{r}_u\times\mathbf{r}_v=\langle\sin v,-\cos v,u\rangle\), with length \(\sqrt{1+u^2}\). So \(\iint_S y\,dS=\int_0^\pi\sin v\,dv\int_0^2u\sqrt{1+u^2}\,du=2\cdot\tfrac13\left(5^{3/2}-1\right)=\tfrac23\left(5\sqrt5-1\right)\approx 6.787\).`},
{id:'wa-ssi-3',source:SSI,hw:'',num:3,module:'10-greens-surfaces',chapter:'scalar',status:'wa',
 prompt:R`Evaluate \(\iint_S y^2\,dS\), where \(S\) is the part of the sphere \(x^2+y^2+z^2=1\) that lies above the cone \(z=\sqrt{x^2+y^2}\).`,
 parts:[{k:'I',label:R`\(\iint_S y^2\,dS=\)`,kind:'number',ans:Math.PI*(8-5*Math.sqrt(2))/12}],
 solution:R`On the unit sphere \(dS=\sin\phi\,d\phi\,d\theta\), and the cone is \(\phi=\tfrac\pi4\), so \(0\le\phi\le\tfrac\pi4\). With \(y=\sin\phi\sin\theta\): \(\int_0^{2\pi}\sin^2\theta\,d\theta\int_0^{\pi/4}\sin^3\phi\,d\phi=\pi\left[-\cos\phi+\tfrac{\cos^3\phi}{3}\right]_0^{\pi/4}=\pi\left(\tfrac23-\tfrac{5\sqrt2}{12}\right)=\tfrac{\pi(8-5\sqrt2)}{12}\approx 0.243\).`}
);
})();
