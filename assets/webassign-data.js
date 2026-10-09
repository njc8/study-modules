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
