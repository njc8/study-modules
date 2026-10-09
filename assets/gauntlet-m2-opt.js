/* Midterm 2 gauntlet items, optimization (MATH 212, Fall 2026: Stewart 14.7 to 14.8).
   Sources: past-due WebAssign sets, the Fall 2024 Midterm 2 (practice exam), and "Practice" problems written for this bank.
   Format: see the header of assets/gauntlet.js. */
window.GAUNTLET_M2=window.GAUNTLET_M2||[];
(function(){
const R=String.raw;
/* answer lists: an empty reference list means the answer is DNE */
const pts=ref=>v=>checkPointList(v,ref);
const nums=ref=>v=>checkNumberList(v,ref);

window.GAUNTLET_M2.push(
{id:'o-classify',topic:'opt',title:'Classifying critical points with the second derivative test',
 concept:{q:R`At a critical point of \(f(x,y)\), what does \(D=f_{xx}f_{yy}-f_{xy}^2\) tell you? Why is \(D>0\) alone not enough to say whether you have a maximum or a minimum?`,
  rubric:['D less than 0 means a saddle point, D greater than 0 means a local max or min, and D = 0 means the test is inconclusive.','When D is greater than 0, the sign of f_xx (or f_yy) decides it: positive means a local minimum, negative means a local maximum. D is a product-type quantity and does not know which way the surface curves.'],
  model:R`<p>\(D\) measures whether the surface curves the same way in every direction. If \(D\lt0\) the curvature has opposite signs in different directions, so the point is a <b>saddle</b>. If \(D>0\) the curvature has one sign everywhere, so the point is a local extreme, but \(D\) does not say which one. For that, look at \(f_{xx}\): \(f_{xx}>0\) is a local minimum (bowl up), \(f_{xx}\lt0\) is a local maximum (dome). If \(D=0\) the test tells you nothing.</p>`},
 app:{source:'Fall 2024 Midterm 2 · Problem 1',
  prompt:R`Find all critical points of \(f(x,y)=y^4-2x^2y+2x^2-8y^2\) and classify each one as a local minimum, a local maximum, or a saddle point. Enter points as a comma separated list, and type DNE if there are none.`,
  parts:[
   {k:'all',label:'all critical points:',kind:'custom',check:pts([[0,0],[0,2],[0,-2]]),sol:'(0,0), (0,2), (0,-2)',xwide:true,placeholder:'(a, b), (c, d), ...'},
   {k:'min',label:'local minima:',kind:'custom',check:pts([[0,-2]]),sol:'(0,-2)',xwide:true,placeholder:'(a, b), ... or DNE'},
   {k:'max',label:'local maxima:',kind:'custom',check:pts([]),sol:'DNE',xwide:true,placeholder:'(a, b), ... or DNE'},
   {k:'sad',label:'saddle points:',kind:'custom',check:pts([[0,0],[0,2]]),sol:'(0,0), (0,2)',xwide:true,placeholder:'(a, b), ... or DNE'}],
  solution:R`\(f_x=-4xy+4x=4x(1-y)\) and \(f_y=4y^3-2x^2-16y\). Factor \(f_x=0\) instead of dividing by anything: either \(x=0\) or \(y=1\).
   If \(y=1\), then \(f_y=4-2x^2-16=0\) gives \(-2x^2=12\), which is impossible. If \(x=0\), then \(f_y=4y(y^2-4)=0\) gives \(y=0,\pm2\). The critical points are \((0,0)\), \((0,2)\), \((0,-2)\).
   Now \(f_{xx}=4-4y\), \(f_{yy}=12y^2-16\), \(f_{xy}=-4x\). At \((0,0)\): \(D=4\cdot(-16)=-64\lt0\), saddle. At \((0,2)\): \(D=(-4)(32)=-128\lt0\), saddle. At \((0,-2)\): \(D=12\cdot32=384>0\) and \(f_{xx}=12>0\), a local minimum with \(f(0,-2)=-16\). There is no local maximum.`}},

{id:'o-values',topic:'opt',title:'Extreme values versus extreme points',
 concept:{q:R`What is the difference between a local maximum <i>point</i> and a local maximum <i>value</i>? And when you solve \(f_x=0\), why do you factor instead of dividing both sides by a common factor?`,
  rubric:['The point is where it happens, the coordinates (a, b); the value is the number f(a, b) at that point.','Dividing by a factor that can be zero throws away the critical points where that factor is 0, so you factor and set each factor equal to 0.'],
  model:R`<p>The local max <b>point</b> is the location \((a,b)\) in the plane. The local max <b>value</b> is the height \(f(a,b)\) there, a single number. Read the question to see which one it asks for.</p><p>When you solve \(f_x=0\), factor and set each factor to zero. If you divide by a factor like \(x-3\), you silently lose the solutions with \(x=3\).</p>`},
 app:{source:'WebAssign: Extrema · Problem 3',
  prompt:R`Let \(f(x,y)=x^3+y^3-3x^2-9y^2-9x\). Find the local maximum values, the local minimum values, and the saddle points. Enter values and points as comma separated lists, and type DNE if there are none.`,
  parts:[
   {k:'max',label:'local maximum values:',kind:'custom',check:nums([5]),sol:'5',placeholder:'numbers, or DNE'},
   {k:'min',label:'local minimum values:',kind:'custom',check:nums([-135]),sol:'-135',placeholder:'numbers, or DNE'},
   {k:'sad',label:'saddle points:',kind:'custom',check:pts([[3,0],[-1,6]]),sol:'(3,0), (-1,6)',xwide:true,placeholder:'(a, b), ... or DNE'}],
  solution:R`\(f_x=3x^2-6x-9=3(x-3)(x+1)\) and \(f_y=3y^2-18y=3y(y-6)\). So \(x\in\{3,-1\}\) and \(y\in\{0,6\}\), giving four critical points.
   \(f_{xx}=6x-6\), \(f_{yy}=6y-18\), \(f_{xy}=0\), so \(D=(6x-6)(6y-18)\).
   \((3,0)\): \(D=12\cdot(-18)\lt0\), saddle. \((3,6)\): \(D=12\cdot18>0\), \(f_{xx}=12>0\), local min with \(f(3,6)=27+216-27-324-27=-135\). \((-1,0)\): \(D=(-12)(-18)>0\), \(f_{xx}=-12\lt0\), local max with \(f(-1,0)=-1-3+9=5\). \((-1,6)\): \(D=(-12)(18)\lt0\), saddle.`}},

{id:'o-saddles',topic:'opt',title:'Critical points that are not extremes',
 concept:{q:R`Can a function have critical points but no local maximum or minimum at all? What does a saddle point look like on a contour map?`,
  rubric:['Yes: a critical point only has a horizontal tangent plane, and at a saddle the function rises in some directions and falls in others, so it is not an extreme.','On a contour map a saddle shows level curves of both higher and lower values meeting around the point, crossing in an X-like pattern; the point is a max along one direction and a min along another.'],
  model:R`<p>Yes. \(\nabla f=\mathbf 0\) only says the tangent plane is flat. At a <b>saddle</b> the surface goes up in one direction and down in another, like a mountain pass, so there is no local extreme.</p><p>On a contour map, near a saddle the level curves for values above and below \(f(P)\) alternate around \(P\), and the curve through \(P\) crosses itself in an X.</p>`},
 app:{source:'WebAssign: Extrema · Problem 2',
  prompt:R`Let \(f(x,y)=(x-y)(16-xy)\). Find the local maximum values, the local minimum values, and the saddle points. Type DNE where none exist, and enter points as a comma separated list.`,
  parts:[
   {k:'max',label:'local maximum values:',kind:'custom',check:nums([]),sol:'DNE',placeholder:'numbers, or DNE'},
   {k:'min',label:'local minimum values:',kind:'custom',check:nums([]),sol:'DNE',placeholder:'numbers, or DNE'},
   {k:'sad',label:'saddle points:',kind:'custom',check:pts([[4,4],[-4,-4]]),sol:'(4,4), (-4,-4)',xwide:true,placeholder:'(a, b), ... or DNE'}],
  solution:R`Expand: \(f=16x-16y-x^2y+xy^2\). Then \(f_x=16-2xy+y^2\) and \(f_y=-16+2xy-x^2\). Adding gives \(y^2-x^2=0\), so \(y=\pm x\).
   If \(y=-x\): \(f_x=16+2x^2+x^2>0\), never zero. If \(y=x\): \(f_x=16-x^2=0\), so \(x=\pm4\). The critical points are \((4,4)\) and \((-4,-4)\).
   \(f_{xx}=-2y\), \(f_{yy}=2x\), \(f_{xy}=-2x+2y\). At \((4,4)\): \(D=(-8)(8)-0=-64\lt0\). At \((-4,-4)\): \(D=(8)(-8)-0=-64\lt0\). Both are saddles, so there are no local extreme values.`}},

{id:'o-abs-square',topic:'opt',title:'Absolute extrema on a closed square',
 concept:{q:R`On a closed bounded region, what is the full list of places an absolute maximum or minimum can occur? Why do you not need the second derivative test?`,
  rubric:['Candidates: critical points in the interior, plus the extreme points of f on the boundary (including corners/endpoints of each edge).','Compare the values of f at all candidates and take the largest and smallest; the Extreme Value Theorem guarantees they exist, so there is no need to classify anything.'],
  model:R`<p>By the Extreme Value Theorem, a continuous \(f\) on a closed bounded region has an absolute max and min. They occur either at a <b>critical point inside</b> the region or at a point of the <b>boundary</b>, so you check each edge as a one-variable problem and include the corners.</p><p>Then you just evaluate \(f\) at every candidate and compare. The largest value is the absolute max, the smallest is the absolute min. No classification is needed, which is why the second derivative test is skipped.</p>`},
 app:{source:'WebAssign: Extrema · Problem 4',
  prompt:R`Find the absolute maximum and minimum of \(f(x,y)=x^2+y^2+x^2y+8\) on the square \(|x|\le1,\ |y|\le1\).`,
  parts:[
   {k:'cp',label:'interior critical point:',kind:'vector',ans:[0,0],sol:'(0,0)',placeholder:'(x, y)'},
   {k:'max',label:'absolute maximum:',kind:'number',ans:11,sol:'11'},
   {k:'min',label:'absolute minimum:',kind:'number',ans:8,sol:'8'}],
  solution:R`Interior: \(f_x=2x(1+y)\) and \(f_y=2y+x^2\). Inside the square \(1+y>0\), so \(x=0\), and then \(y=0\). The point \((0,0)\) gives \(f=8\).
   Edges: \(y=-1\): \(f=x^2+1-x^2+8=9\), constant. \(x=\pm1\): \(f=y^2+y+9\) on \([-1,1]\), with vertex at \(y=-\tfrac12\) giving \(\tfrac{35}{4}\), and endpoint values \(9\) and \(11\). \(y=1\): \(f=2x^2+9\) on \([-1,1]\), from \(9\) up to \(11\).
   The largest value is \(11\) (at \((\pm1,1)\)) and the smallest is \(8\) (at \((0,0)\)).`}},

{id:'o-abs-quad',topic:'opt',title:'Absolute extrema on a polygon with a slanted edge',
 concept:{q:R`When one edge of a region is a slanted line, how do you find the extreme values of \(f\) along it? What must you not forget to include?`,
  rubric:['Substitute the equation of the line (or parametrize it) to turn f into a function of one variable, then find its critical points on that edge.','Always include the endpoints (corners) of the edge as candidates, and compare all values at the end.'],
  model:R`<p>Write the line as \(y=mx+b\) (or parametrize it) and substitute into \(f\). That makes \(f\) a function of one variable on a closed interval, so you use Calc 1: set the derivative to zero and also check both <b>endpoints</b>. The endpoints are the corners of the polygon, and they are shared with neighboring edges. Missing a corner is the most common error.</p>`},
 app:{source:'WebAssign: Extrema · Problem 5',
  prompt:R`Find the absolute maximum and minimum values of \(f(x,y)=x^3-3x-y^3+12y+7\) on the quadrilateral with vertices \((-2,3)\), \((2,3)\), \((2,2)\), \((-2,-2)\).`,
  parts:[
   {k:'max',label:'absolute maximum:',kind:'number',ans:25,sol:'25'},
   {k:'min',label:'absolute minimum:',kind:'number',ans:-11,sol:'-11'}],
  solution:R`The edges are \(y=3\) (top), \(x=2\) (right, \(2\le y\le3\)), \(y=x\) (slanted), and \(x=-2\) (left, \(-2\le y\le3\)).
   Interior: \(f_x=3x^2-3\) and \(f_y=12-3y^2\) vanish at \((\pm1,\pm2)\). Only \((-1,2)\) and \((1,2)\) lie inside (they need \(y>x\)). Values: \(f(-1,2)=25\), \(f(1,2)=21\).
   Top \(y=3\): \(f=x^3-3x+16\), values \(18,14\) at \(x=\mp1\) and \(14,18\) at the ends. Right \(x=2\): \(f=9-y^3+12y\) is decreasing on \([2,3]\), from \(25\) to \(18\). Slanted \(y=x\): \(f=9x+7\), from \(-11\) to \(25\). Left \(x=-2\): \(f=5-y^3+12y\), with values \(-11\) at \(y=-2\), \(21\) at \(y=2\), \(14\) at \(y=3\).
   Maximum \(25\) (at \((-1,2)\) and \((2,2)\)), minimum \(-11\) (at \((-2,-2)\)).`}},

{id:'o-abs-disk',topic:'opt',title:'Absolute extrema on a disk off the origin',
 concept:{q:R`A region is the disk \(x^2+2x+y^2\le0\). How do you recognize what region this is, and how do you find the extreme values of \(f\) on its boundary circle?`,
  rubric:['Complete the square to see the disk: (x+1)^2 + y^2 <= 1, centered at (-1, 0) with radius 1; check whether critical points lie inside or on the boundary.','On the boundary, use the circle equation to eliminate y (or y^2), or parametrize it, reducing f to one variable on an interval; then check the endpoints of that interval.'],
  model:R`<p>Complete the square: \((x+1)^2+y^2\le1\), the disk of radius \(1\) centered at \((-1,0)\). A critical point only counts if it is in the region; one that sits on the boundary is handled with the boundary.</p><p>On the boundary \(y^2=-x^2-2x\) (or parametrize \(x=-1+\cos t,\ y=\sin t\)). If \(f\) has only \(y^2\), substituting gives a one-variable function of \(x\) on \([-2,0]\). Find its critical points and compare with the ends \(x=-2\) and \(x=0\).</p>`},
 app:{source:'Fall 2024 Midterm 2 · Problem 3',
  prompt:R`Find the absolute maximum and minimum of \(f(x,y)=\tfrac43x^3+y^2\) on the disk \(x^2+2x+y^2\le0\). Give exact values.`,
  parts:[
   {k:'max',label:'absolute maximum:',kind:'number',ans:7/12,sol:'7/12'},
   {k:'min',label:'absolute minimum:',kind:'number',ans:-32/3,sol:'-32/3'},
   {k:'xm',label:R`\(x\)-coordinate of a boundary point where the maximum occurs:`,kind:'number',ans:-0.5,sol:'-1/2'}],
  solution:R`The region is \((x+1)^2+y^2\le1\), so \(-2\le x\le0\). Interior: \(f_x=4x^2\) and \(f_y=2y\) vanish only at \((0,0)\), which is on the boundary, not inside. So everything happens on the boundary.
   On the boundary \(y^2=-x^2-2x\), so \(f=\tfrac43x^3-x^2-2x\) for \(x\in[-2,0]\). Then \(f'=4x^2-2x-2=2(2x+1)(x-1)\), which vanishes at \(x=-\tfrac12\) in the interval (\(x=1\) is outside).
   Candidates: \(x=-\tfrac12\): \(f=-\tfrac16-\tfrac14+1=\tfrac7{12}\). \(x=0\): \(f=0\). \(x=-2\): \(f=-\tfrac{32}3-4+4=-\tfrac{32}3\).
   Maximum \(\tfrac7{12}\), minimum \(-\tfrac{32}3\).`}},

{id:'o-lagrange-circle',topic:'opt',title:'Why the gradients line up (Lagrange multipliers)',
 concept:{q:R`Why must \(\nabla f=\lambda\nabla g\) hold at a point where \(f\) has a maximum or minimum on the curve \(g(x,y)=k\)? Explain it in terms of level curves.`,
  rubric:['The gradient of g is perpendicular to the constraint curve, and the gradient of f is perpendicular to the level curve of f through that point.','At a constrained extreme the level curve of f just touches the constraint curve (tangent, not crossing); so the two curves share a tangent line and their gradients are parallel.'],
  model:R`<p>Walk along the constraint curve \(g=k\). If the level curve of \(f\) through your position <i>crossed</i> the constraint curve, you could keep walking and move to a higher or lower level, so you would not be at an extreme. At a constrained max or min the level curve of \(f\) must be <b>tangent</b> to the constraint curve. Gradients are perpendicular to their level curves, so \(\nabla f\parallel\nabla g\), that is \(\nabla f=\lambda\nabla g\).</p>`},
 app:{source:'WebAssign: Constrained Optimization · Problem 1',
  prompt:R`Find the maximum and minimum values of \(f(x,y)=5xe^{y}\) on the circle \(x^2+y^2=2\). Give exact values.`,
  parts:[
   {k:'max',label:'maximum value:',kind:'number',ans:5*Math.E,sol:'5e'},
   {k:'min',label:'minimum value:',kind:'number',ans:-5*Math.E,sol:'-5e'}],
  solution:R`\(\nabla f=\langle5e^y,\ 5xe^y\rangle\) and \(\nabla g=\langle2x,\ 2y\rangle\). Setting \(\nabla f=\lambda\nabla g\): \(5e^y=2\lambda x\) and \(5xe^y=2\lambda y\). Substitute the first into the second: \(x\cdot2\lambda x=2\lambda y\). Here \(\lambda\ne0\) (else \(5e^y=0\)), so \(y=x^2\).
   Then \(x^2+x^4=2\), so \((x^2-1)(x^2+2)=0\) and \(x=\pm1\), \(y=1\). Values: \(f(1,1)=5e\) and \(f(-1,1)=-5e\). The circle is closed and bounded, so these are the max and min.`}},

{id:'o-box-plane',topic:'opt',title:'Setting up an optimization word problem',
 concept:{q:R`In an optimization word problem, how do you decide which quantity is the objective and which is the constraint? And how do you know your critical point gives the maximum and not something else?`,
  rubric:['The objective is the quantity you are asked to make largest or smallest (volume, distance, cost); the constraint is the condition the variables must satisfy (a surface the vertex lies on, a fixed budget).','Check the answer: the domain is bounded and f goes to 0 (or the problem is closed and bounded) at its edges, so the single interior critical point must be the max; or use the second derivative test.'],
  model:R`<p>The <b>objective</b> is the thing you are asked to optimize, such as the volume. The <b>constraint</b> is the relationship the variables must obey, such as a vertex lying on a given plane. Either solve the constraint for one variable and substitute, or use \(\nabla f=\lambda\nabla g\).</p><p>To justify a max, note that the volume is \(0\) at the edges of the allowed domain (a side length is \(0\)) and positive inside, so the interior critical point must be the maximum. The second derivative test also works.</p>`},
 app:{source:'WebAssign: Extrema · Problem 6',
  prompt:R`Find the volume of the largest rectangular box in the first octant with three faces in the coordinate planes and one vertex in the plane \(x+2y+3z=15\). Give an exact value.`,
  parts:[{k:'V',label:'maximum volume:',kind:'number',ans:125/6,sol:'125/6'}],
  solution:R`The vertex is \((x,y,z)\) and the volume is \(V=xyz\). The constraint gives \(z=\tfrac{15-x-2y}3\), so \(V=\tfrac13(15xy-x^2y-2xy^2)\).
   \(V_x=\tfrac13y(15-2x-2y)=0\) and \(V_y=\tfrac13x(15-x-4y)=0\). With \(x,y>0\): \(2x+2y=15\) and \(x+4y=15\), so \(2y=7.5\), \(y=\tfrac52\), \(x=5\), \(z=\tfrac53\).
   \(V=5\cdot\tfrac52\cdot\tfrac53=\tfrac{125}6\). The volume is \(0\) on the edges of the domain, so this critical point is the maximum.`}},

{id:'o-region-ellipse',topic:'opt',title:'Interior plus boundary on a curved region',
 concept:{q:R`For a region bounded by a curve, such as the inside of an ellipse, how do you combine the interior critical points with a Lagrange or parametrization step on the boundary to find the absolute extremes?`,
  rubric:['Find critical points in the open interior, and separately find the extreme values on the boundary curve (Lagrange multipliers or a parametrization).','Compare f at all the candidates from both parts; the largest is the absolute max, the smallest the absolute min.'],
  model:R`<p>Two separate searches. First find where \(\nabla f=\mathbf0\) inside the region. Second, treat the boundary curve as a constraint \(g=k\) and use Lagrange multipliers (or parametrize the curve) to find the extremes along it. Then list every candidate value together and pick the largest and smallest. The region is closed and bounded, so both extremes exist.</p>`},
 app:{source:'WebAssign: Constrained Optimization · Problem 4',
  prompt:R`Find the maximum and minimum values of \(f(x,y)=e^{-xy}\) on the region \(x^2+4y^2\le1\). Give exact values.`,
  parts:[
   {k:'max',label:'maximum value:',kind:'number',ans:Math.exp(0.25),sol:'e^(1/4)'},
   {k:'min',label:'minimum value:',kind:'number',ans:Math.exp(-0.25),sol:'e^(-1/4)'}],
  solution:R`Interior: \(\nabla f=-e^{-xy}\langle y,\ x\rangle=\mathbf0\) only at \((0,0)\), where \(f=1\).
   Boundary \(x^2+4y^2=1\): since \(e^{-xy}\) is increasing in \(-xy\), we need the extreme values of \(xy\). Lagrange: \(y=2\lambda x\) and \(x=8\lambda y\), so \(x^2=4y^2\), and the constraint gives \(x^2=\tfrac12\), \(y^2=\tfrac18\). Then \(xy=\pm\tfrac14\). (Or parametrize \(x=\cos t,\ y=\tfrac12\sin t\) so \(xy=\tfrac14\sin2t\).)
   Candidates: \(1\), \(e^{-1/4}\) (where \(xy=\tfrac14\)), \(e^{1/4}\) (where \(xy=-\tfrac14\)). Maximum \(e^{1/4}\), minimum \(e^{-1/4}\).`}},

{id:'o-closest',topic:'opt',title:'Minimize the squared distance',
 concept:{q:R`To find the point on a surface closest to the origin, why do we minimize the squared distance \(x^2+y^2+z^2\) instead of the distance itself? Why does that give the same point?`,
  rubric:['The square root is messy to differentiate, and the squared distance is a polynomial, which makes the gradient equations much simpler.','Square root is an increasing function, so d and d^2 are smallest at exactly the same points; at the end take the square root to report the distance.'],
  model:R`<p>\(d=\sqrt{x^2+y^2+z^2}\) is awkward to differentiate, while \(d^2=x^2+y^2+z^2\) is a polynomial. Since \(\sqrt{\cdot}\) is increasing, the point that makes \(d^2\) smallest also makes \(d\) smallest. Minimize \(d^2\), then take a square root at the end if the question asks for the distance.</p>`},
 app:{source:'WebAssign: Rectangular Integrals · Problem 1',
  prompt:R`Find the points on the surface \(y^2=64+xz\) that are closest to the origin, and the minimum distance. List the point with the smaller \(y\)-value first.`,
  parts:[
   {k:'p1',label:R`point with the smaller \(y\)-value:`,kind:'vector',ans:[0,-8,0],sol:'(0,-8,0)',placeholder:'(x, y, z)'},
   {k:'p2',label:R`point with the larger \(y\)-value:`,kind:'vector',ans:[0,8,0],sol:'(0,8,0)',placeholder:'(x, y, z)'},
   {k:'d',label:'minimum distance:',kind:'number',ans:8,sol:'8'}],
  solution:R`Minimize \(d^2=x^2+y^2+z^2\) subject to \(y^2=64+xz\). Substituting the constraint: \(d^2=x^2+z^2+xz+64\). Complete the square: \(x^2+xz+z^2=\left(x+\tfrac z2\right)^2+\tfrac34z^2\ge0\), with equality only at \(x=z=0\).
   Then \(y^2=64\), so \(y=\pm8\). The points are \((0,-8,0)\) and \((0,8,0)\), and the minimum distance is \(\sqrt{64}=8\).`}},

{id:'o-unbounded',topic:'opt',title:'When a Lagrange candidate is not a maximum',
 concept:{q:R`When can Lagrange multipliers produce a candidate that is not a maximum or minimum? When does an extreme value fail to exist at all?`,
  rubric:['Lagrange multipliers only find candidates (points where the gradients are parallel); each candidate must be checked, because it may be a min, a max, or neither.','An extreme value can fail to exist if the constraint set is not closed and bounded (for example an unbounded plane), because f can grow without bound or only approach a value.'],
  model:R`<p>The method only finds points where \(\nabla f\parallel\nabla g\). It does not say which kind of point you found. If the constraint set is <b>closed and bounded</b> (a circle, a sphere), the max and min exist and are among the candidates. If it is <b>unbounded</b> (a plane, a line), \(f\) may grow forever, so there may be a min but no max, or the reverse. Compare the candidate with nearby values or reason about the behavior far away.</p>`},
 app:{source:'Practice',
  prompt:R`Consider \(f(x,y,z)=2x^2+y^2+z^2\) subject to \(x+y+z=4\). Find the minimum value, the point where it occurs, and decide whether a maximum exists.`,
  parts:[
   {k:'min',label:'minimum value:',kind:'number',ans:32/5,sol:'32/5'},
   {k:'pt',label:'point where it occurs:',kind:'vector',ans:[0.8,1.6,1.6],sol:'(4/5,8/5,8/5)',placeholder:'(x, y, z)'},
   {k:'max',label:'the maximum value of \\(f\\) on the plane is',kind:'choice',options:[R`\(16\)`,R`\(32/5\)`,'does not exist'],ans:2}],
  solution:R`\(\nabla f=\langle4x,\ 2y,\ 2z\rangle=\lambda\langle1,1,1\rangle\), so \(x=\tfrac\lambda4\), \(y=z=\tfrac\lambda2\). The constraint gives \(\tfrac\lambda4+\lambda=4\), so \(\lambda=\tfrac{16}5\) and \((x,y,z)=\left(\tfrac45,\tfrac85,\tfrac85\right)\).
   \(f=2\cdot\tfrac{16}{25}+\tfrac{64}{25}+\tfrac{64}{25}=\tfrac{160}{25}=\tfrac{32}5\). Since \(f\ge0\) is a sum of squares that grows without bound along the plane (for example \(f(t,-t,4)\to\infty\)), this one candidate is the minimum, and there is no maximum.`}},

{id:'o-one-crit',topic:'opt',title:'One critical point does not mean an absolute extreme',
 concept:{q:R`In one variable, if a function has exactly one critical point on an interval and it is a local minimum, then it is the absolute minimum there. Why can this fail for functions of two variables?`,
  rubric:['In one variable a function cannot leave a lone local min and come back down without another critical point; with two variables, f can decrease along a different path or direction.','So you must check the behavior of f far away, for example along a line or curve where f goes to negative infinity, before calling a local min absolute.'],
  model:R`<p>In one variable, the graph can only go one way on each side of the point, so a lone local min is forced to be the global min. In two variables the surface can climb out of the bowl in some directions and then fall away in others without creating another critical point. So after you classify the point, test \(f\) along a few paths far from it. If \(f\to-\infty\) along one path, there is no absolute minimum.</p>`},
 app:{source:'Practice',
  prompt:R`Let \(f(x,y)=x^2(1+y)^3+y^2\).`,
  parts:[
   {k:'cp',label:'the only critical point:',kind:'vector',ans:[0,0],sol:'(0,0)',placeholder:'(x, y)'},
   {k:'cls',label:'it is a',kind:'choice',options:['local minimum','local maximum','saddle point','inconclusive'],ans:0},
   {k:'v',label:R`\(f(3,-2)=\)`,kind:'number',ans:-5,sol:'-5'},
   {k:'abs',label:R`Does \(f\) have an absolute minimum on \(\mathbb{R}^2\)?`,kind:'choice',options:['yes, at the origin','yes, somewhere else','no'],ans:2}],
  solution:R`\(f_x=2x(1+y)^3\) and \(f_y=3x^2(1+y)^2+2y\). From \(f_x=0\): \(x=0\) or \(y=-1\). If \(y=-1\) then \(f_y=-2\ne0\). If \(x=0\) then \(f_y=2y=0\). The only critical point is \((0,0)\).
   \(f_{xx}=2(1+y)^3=2\), \(f_{yy}=6x^2(1+y)+2=2\), \(f_{xy}=6x(1+y)^2=0\) at the origin. \(D=4>0\) and \(f_{xx}>0\), a local minimum with \(f(0,0)=0\).
   But \(f(3,-2)=9\cdot(-1)+4=-5\lt0\). In fact \(f(x,-2)=4-x^2\to-\infty\), so there is no absolute minimum even though there is only one critical point.`}},

{id:'o-endpoints',topic:'opt',title:'Checking the ends of a constraint curve',
 concept:{q:R`Why must you check the endpoints of a constraint curve separately from the Lagrange condition?`,
  rubric:['Lagrange multipliers only find interior points of the curve where the gradients are parallel; at an endpoint the curve just stops, so the extreme can occur there without the gradients being parallel.','Compare f at the Lagrange points and the endpoints; the extremes are among them (the curve is closed and bounded).'],
  model:R`<p>\(\nabla f=\lambda\nabla g\) is the condition for a point where you can move both ways along the curve and \(f\) stays level. At an <b>endpoint</b> you can only move one way, so \(f\) can be larger or smaller there even though the gradients are not parallel (or \(\nabla g\) may even be undefined). So list the Lagrange points <i>and</i> the endpoints, and compare all the values.</p>`},
 app:{source:'Practice',
  prompt:R`Find the maximum and minimum values of \(f(x,y)=3x+y\) on the curve \(\sqrt x+\sqrt y=4\) with \(x,y\ge0\), and the points where they occur.`,
  parts:[
   {k:'max',label:'maximum value:',kind:'number',ans:48,sol:'48'},
   {k:'pmax',label:'point of the maximum:',kind:'vector',ans:[16,0],sol:'(16,0)',placeholder:'(x, y)'},
   {k:'min',label:'minimum value:',kind:'number',ans:12,sol:'12'},
   {k:'pmin',label:'point of the minimum:',kind:'vector',ans:[1,9],sol:'(1,9)',placeholder:'(x, y)'}],
  solution:R`Let \(g=\sqrt x+\sqrt y\). \(\nabla f=\langle3,1\rangle=\lambda\langle\tfrac1{2\sqrt x},\tfrac1{2\sqrt y}\rangle\), so \(3=\tfrac\lambda{2\sqrt x}\) and \(1=\tfrac\lambda{2\sqrt y}\). Dividing: \(3=\tfrac{\sqrt y}{\sqrt x}\), so \(\sqrt y=3\sqrt x\). The constraint gives \(4\sqrt x=4\), so \(\sqrt x=1\), \(\sqrt y=3\): the point \((1,9)\) with \(f=12\).
   The endpoints are where one coordinate is zero: \((16,0)\) with \(f=48\) and \((0,16)\) with \(f=16\), and there the gradients are not parallel.
   Maximum \(48\) at \((16,0)\), minimum \(12\) at \((1,9)\).`}}
);
})();
