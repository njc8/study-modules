/* Midterm 2 gauntlet items, double integrals (MATH 212, Fall 2026: Stewart 15.1 to 15.5).
   Sources: past-due WebAssign sets, the Fall 2024 Midterm 2 (practice exam), and "Practice" problems written for this bank.
   Format: see the header of assets/gauntlet.js. */
window.GAUNTLET_M2=window.GAUNTLET_M2||[];
(function(){
const R=String.raw;
const C={a:'#d97706',b:'#2563eb',c:'#16a34a',d:'#7c3aed',e:'#db2777',ink:'#57534e'};

/* contour map of f = x^2 - y^2 with three shaded disks (the sign-map item) */
const signFig={style:'aspect-ratio:1;max-width:420px',opts:{xmin:-3.5,xmax:3.5,ymin:-3.5,ymax:3.5},
  draw(p,solved){
    const lv=[-4,-3,-2,-1,0,1,2,3,4];
    p.contour((x,y)=>x*x-y*y,lv,{colors:lv.map(l=>l<0?C.b:l>0?C.a:C.ink),width:1.3});
    const disk=(c,r)=>p.poly(Array.from({length:81},(_,i)=>[c[0]+r*Math.cos(i/80*2*Math.PI),c[1]+r*Math.sin(i/80*2*Math.PI)]),{fill:'rgba(124,58,237,.22)',stroke:C.d,width:1.6});
    disk([2,0],1);disk([0,0],0.8);disk([0,2],1);
    p.param(t=>[Math.cos(t),2+Math.sin(t)],0,2*Math.PI,{color:'#3b0764',width:3.2,n:120});
    const bold='600 14px -apple-system,Segoe UI,sans-serif';
    p.text([2.4,0.35],'D₁',{color:C.d,font:bold,align:'center',dy:5});p.text([-0.4,0.3],'D₂',{color:C.d,font:bold,align:'center',dy:5});
    p.text([-0.45,2.35],'D₃',{color:C.d,font:bold,align:'center',dy:5});p.text([1.05,2.95],'C',{color:'#3b0764',font:bold});
    if(solved){p.text([-3.4,-3.2],'f = x² − y²',{color:C.ink,font:bold});}
  }};

window.GAUNTLET_M2.push(
{id:'d-riemann',topic:'dbl',title:'Double Riemann sums',
 concept:{q:R`What does a double Riemann sum \(\sum\sum f(x_{ij}^*,y_{ij}^*)\,\Delta A\) add up? How does choosing a corner versus the midpoint of each subrectangle as the sample point change the estimate?`,
  rubric:['Each term is (height of the surface at a sample point) times (area of one subrectangle) = the volume of one thin box; the sum adds up the boxes to estimate the volume under the surface (signed volume, in general).','The sample point only decides which height each box uses. Any choice converges to the same integral as the grid gets finer.','Corner choices lean one way when f is increasing (upper right overestimates), while the midpoint choice tends to balance the errors and is usually more accurate for the same grid.'],
  model:R`<p>Each term \(f(x_{ij}^*,y_{ij}^*)\,\Delta A\) is the volume of a thin box: height of the surface at a sample point times the base area. The sum adds the boxes up, so it estimates the volume under the surface (signed volume when \(f\) goes negative). A finer grid gives a better estimate, and the limit is \(\iint_R f\,dA\).</p><p>The sample point only picks which height each box uses. Upper right corners of an increasing function always overestimate. The midpoint of each rectangle sits between the low and high values, so the errors tend to cancel and the midpoint rule is usually the best for a given grid.</p>`},
 app:{source:'WebAssign: Rectangular Integrals · Problem 2',
  prompt:R`Estimate the volume of the solid under the surface \(z=xy\) and above the rectangle \(R=[7,13]\times[3,7]\). Split \(R\) into \(m=3\) equal pieces in the \(x\)-direction and \(n=2\) equal pieces in the \(y\)-direction.`,
  parts:[{k:'dx',label:R`\(\Delta x=\)`,kind:'number',ans:2,sol:'2'},
   {k:'dy',label:R`\(\Delta y=\)`,kind:'number',ans:2,sol:'2'},
   {k:'da',label:R`\(\Delta A=\)`,kind:'number',ans:4,sol:'4'},
   {k:'ur',label:R`(a) the estimate using upper right corners:`,kind:'number',ans:1584,sol:'1584'},
   {k:'mid',label:R`(b) the estimate using the midpoint rule on the same grid:`,kind:'number',ans:1200,sol:'1200'}],
  solution:R`\(\Delta x=\dfrac{13-7}{3}=2\), \(\Delta y=\dfrac{7-3}{2}=2\), \(\Delta A=4\).<br>
(a) Upper right corners have \(x\in\{9,11,13\}\) and \(y\in\{5,7\}\). Since \(f=xy\) factors, the double sum factors: \(\Delta A\,(9+11+13)(5+7)=4\cdot33\cdot12=1584\).<br>
(b) Midpoints have \(x\in\{8,10,12\}\) and \(y\in\{4,6\}\): \(4\cdot30\cdot10=1200\).<br>
The exact volume is \(\int_7^{13}x\,dx\int_3^7y\,dy=60\cdot20=1200\). The midpoint rule is exact here because \(xy\) is linear in each variable. The corner estimate is too big because \(xy\) is increasing on \(R\).`}},

{id:'d-fubini',topic:'dbl',title:'Fubini and iterated integrals',
 concept:{q:R`What does Fubini's theorem say about \(\iint_R f\,dA\) over a rectangle? In an iterated integral \(\int_a^b\int_c^d f\,dy\,dx\), which integral is done first, and what happens to the other variable while you do it?`,
  rubric:['Fubini: for a rectangle (and f continuous), the double integral equals either iterated integral, so the order can be swapped.','Inside first: the inner integral (dy) is done first, treating x as a constant; its result is a function of x alone.','The outer integral then integrates that function of x over its own limits to give a number.'],
  model:R`<p>For a continuous \(f\) on a rectangle, \(\iint_R f\,dA=\int_a^b\!\int_c^d f\,dy\,dx=\int_c^d\!\int_a^b f\,dx\,dy\): either order gives the same number.</p><p>Inside first means the innermost differential goes with the innermost limits. In \(\int\!\int f\,dy\,dx\) you integrate in \(y\) while holding \(x\) fixed, and the result is a function of \(x\) alone. Then the outer integral sums that function over \(x\) to produce a number.</p>`},
 app:{source:'WebAssign: Rectangular Integrals · Problem 3',
  prompt:R`Evaluate \(\displaystyle\int_1^2\!\int_0^4\,(6x^2y-4x)\,dy\,dx\).`,
  parts:[{k:'v',label:R`value:`,kind:'number',ans:88,sol:'88'}],
  solution:R`Inside first, with \(x\) held fixed: \(\int_0^4(6x^2y-4x)\,dy=\bigl[3x^2y^2-4xy\bigr]_0^4=48x^2-16x\).<br>
Then \(\int_1^2(48x^2-16x)\,dx=\bigl[16x^3-8x^2\bigr]_1^2=(128-32)-(16-8)=88\).`}},

{id:'d-separable',topic:'dbl',title:'Splitting into a product of integrals',
 concept:{q:R`When can a double integral \(\iint_R g(x)h(y)\,dA\) be written as a product of two single integrals? Why does the region have to be a rectangle?`,
  rubric:['It splits when the integrand is a product of a function of x alone and a function of y alone, and the region is a rectangle [a,b] x [c,d]: the result is (integral of g over [a,b]) times (integral of h over [c,d]).','Why: the inner integral pulls the factor that does not depend on the inner variable out front, and with constant limits the inner integral is a plain number, so it also factors out of the outer integral.','If the limits of the inner integral depend on the other variable (a non-rectangle), the inner result is not a constant, so the integral does not factor.'],
  model:R`<p>If \(f(x,y)=g(x)h(y)\) and \(R=[a,b]\times[c,d]\), then \(\iint_R f\,dA=\Bigl(\int_a^b g\,dx\Bigr)\Bigl(\int_c^d h\,dy\Bigr)\).</p><p>Why: in the inner \(dy\) integral, \(g(x)\) is a constant and comes out, leaving \(g(x)\int_c^d h\,dy\). With constant limits that inner integral is just a number, so it comes out of the outer integral too. On a non-rectangular region the inner limits involve \(x\), the inner result is a function of \(x\), and nothing factors.</p>`},
 app:{source:'WebAssign: Rectangular Integrals · Problem 4',
  prompt:R`Evaluate \(\displaystyle\iint_R\frac{3xy^2}{x^2+1}\,dA\), where \(R=[0,3]\times[-2,2]\). Give the exact value.`,
  parts:[{k:'v',label:R`value:`,kind:'number',ans:8*Math.log(10),sol:'8ln(10)',placeholder:'exact'}],
  solution:R`The integrand is \(\dfrac{3x}{x^2+1}\cdot y^2\) on a rectangle, so it splits.<br>
\(\int_0^3\dfrac{3x}{x^2+1}\,dx=\dfrac32\ln(x^2+1)\Big|_0^3=\dfrac32\ln10\). \(\int_{-2}^{2}y^2\,dy=\dfrac{16}{3}\).<br>
Product: \(\dfrac32\ln10\cdot\dfrac{16}{3}=8\ln10\).`}},

{id:'d-volume',topic:'dbl',title:'Volume under a surface',
 concept:{q:R`Why does \(\iint_R f\,dA\) give the volume under the surface \(z=f(x,y)\) when \(f\ge0\)? What does the integral measure if \(f\) is negative on part of \(R\)?`,
  rubric:['Slice the rectangle into small pieces of area dA; above each piece is a thin column of height f, with volume f dA. Adding all columns and taking the limit gives the integral, so it equals the volume under the surface.','If f is negative somewhere, the integral counts that part as negative volume (the surface is below the xy-plane).','So the integral is a signed volume: volume above the plane minus volume below it. Actual volume would need the absolute value of f.'],
  model:R`<p>Cut \(R\) into tiny rectangles of area \(dA\). Above each one the solid is a thin column of height \(f\), with volume \(f\,dA\). Adding up all the columns is the double integral, so for \(f\ge0\) it is the volume under the surface.</p><p>Where \(f\lt0\) the surface is below the \(xy\)-plane and the column counts negatively. The integral is a signed volume: the part above the plane minus the part below. To get actual volume you would integrate \(|f|\).</p>`},
 app:{source:'WebAssign: Rectangular Integrals · Problem 5',
  prompt:R`Find the volume of the solid under the surface \(z=x^2+xy^2\) and above the rectangle \(0\le x\le5\), \(-4\le y\le4\).`,
  parts:[{k:'v',label:R`volume:`,kind:'number',ans:2600/3,sol:'2600/3',placeholder:'exact'}],
  solution:R`\(f=x^2+xy^2\ge0\) on \(R\) (since \(x\ge0\)), so the integral is the volume.<br>
\(V=\int_0^5\!\int_{-4}^{4}(x^2+xy^2)\,dy\,dx=\int_0^5\Bigl(8x^2+\dfrac{128}{3}x\Bigr)dx=\dfrac{8\cdot125}{3}+\dfrac{128}{3}\cdot\dfrac{25}{2}=\dfrac{1000+1600}{3}=\dfrac{2600}{3}\).`}},

{id:'d-two-orders',topic:'dbl',title:'Type I versus type II regions',
 concept:{q:R`A region can be described as type I (\(a\le x\le b\), \(g_1(x)\le y\le g_2(x)\)) or type II (\(c\le y\le d\), \(h_1(y)\le x\le h_2(y)\)). How do you decide which description to use for a given region?`,
  rubric:['Sketch the region, then ask which way the slices run: vertical slices (type I, dy inside) or horizontal slices (type II, dx inside).','Pick the description where each slice enters and leaves through the same two boundary curves all the way across, so the region needs only one iterated integral.','If the top, bottom, left, or right boundary changes formula partway across, that order needs the region split into pieces, so the other order is better.'],
  model:R`<p>Sketch the region and imagine slices. Vertical slices give type I (\(dy\) inside), horizontal slices give type II (\(dx\) inside). A slice must start on one boundary curve and end on another, and those two curves must stay the same across the whole range of the outer variable.</p><p>If a slice's entering or leaving curve changes formula somewhere, that order forces you to split the region into two or more integrals. Choose the order where nothing changes, and you get a single iterated integral.</p>`},
 app:{source:'Fall 2024 Midterm 2 · Problem 2',
  prompt:R`Let \(D\) be the region in the first quadrant to the right of the parabola \(y=x^2\), below the curve \(y=\sqrt{4-3x^2}\), and above the \(x\)-axis. Set up \(\iint_D f(x,y)\,dA\) as <b>one</b> iterated integral. Do not evaluate it.`,
  parts:[{k:'ord',label:'The integral should be written as',kind:'choice',options:['dx dy (y outside)','dy dx (x outside)'],ans:0},
   {k:'lo',label:R`outer lower limit: \(y\) from`,kind:'number',ans:0,sol:'0'},
   {k:'hi',label:R`outer upper limit: \(y\) to`,kind:'number',ans:1,sol:'1'},
   {k:'xl',label:R`inner lower limit: \(x\) from`,kind:'expr',vars:['y'],domain:{y:[0.05,0.95]},ans:e=>Math.sqrt(e.y),sol:'sqrt(y)',placeholder:'in terms of y'},
   {k:'xr',label:R`inner upper limit: \(x\) to`,kind:'expr',vars:['y'],domain:{y:[0.05,0.95]},ans:e=>Math.sqrt((4-e.y*e.y)/3),sol:'sqrt((4-y^2)/3)',placeholder:'in terms of y'},
   {k:'cnt',label:'How many iterated integrals would the other order need?',kind:'choice',options:['1','2','3'],ans:1}],
  solution:R`The curves meet where \(x^2=\sqrt{4-3x^2}\), so \(x^4+3x^2-4=0\), \((x^2+4)(x^2-1)=0\), giving \(x=1\), \(y=1\). So \(y\) runs from \(0\) to \(1\).<br>
Horizontal slices at height \(y\) enter on the parabola, \(x=\sqrt y\), and leave on the ellipse \(3x^2+y^2=4\), \(x=\sqrt{(4-y^2)/3}\), for every \(y\) from 0 to 1:
\[\iint_D f\,dA=\int_0^1\!\int_{\sqrt y}^{\sqrt{(4-y^2)/3}}f(x,y)\,dx\,dy.\]
Vertical slices change their top boundary at \(x=1\) (the parabola \(y=x^2\) for \(0\le x\le1\), the ellipse for \(1\le x\le 2/\sqrt3\)), so \(dy\,dx\) needs <b>two</b> integrals.`}},

{id:'d-reverse',topic:'dbl',title:'Reversing the order of integration',
 concept:{q:R`Why can reversing the order of integration turn an impossible iterated integral into an easy one? What must you do to the limits when you reverse, and why can't you just swap them?`,
  rubric:['Some integrands have no elementary antiderivative in one variable but are easy in the other. Reversing makes the easy variable the inner one.','The limits describe a region. Sketch it and re-describe it with the other variable outside: new constants for the outer variable, and curves (solved for the new inner variable) for the inner limits.','Swapping the limits symbol for symbol is wrong because the inner limits depend on the outer variable; the new limits come from the region, not from the old ones.'],
  model:R`<p>If the inner antiderivative does not exist in elementary form, the integral is stuck. The same double integral over the same region taken in the other order may have an inner integral you can do.</p><p>To reverse, read the limits as a region, draw it, and describe it again from the other direction: constant limits for the new outer variable, boundary curves solved for the new inner variable. Swapping the limits in place gives a different region and a different answer.</p>`},
 app:{source:'Fall 2024 Midterm 2 · Problem 5',
  prompt:R`Evaluate \(\displaystyle\int_0^1\!\int_{y^{2/3}}^{1}\frac{y}{x^4+1}\,dx\,dy\) by reversing the order of integration. Give the exact value.`,
  parts:[{k:'v',label:R`value:`,kind:'number',ans:Math.log(2)/8,sol:'ln(2)/8',placeholder:'exact'}],
  solution:R`The region: \(0\le y\le1\) and \(y^{2/3}\le x\le1\). The left edge \(x=y^{2/3}\) is \(y=x^{3/2}\), so the region is \(0\le x\le1\), \(0\le y\le x^{3/2}\).<br>
\(\displaystyle\int_0^1\!\int_0^{x^{3/2}}\frac{y}{x^4+1}\,dy\,dx=\int_0^1\frac{x^3}{2(x^4+1)}\,dx=\frac18\ln(x^4+1)\Big|_0^1=\frac{\ln2}{8}\).<br>
In the original order, \(\int\frac{dx}{x^4+1}\) has no friendly antiderivative.`}},

{id:'d-polar-sector',topic:'dbl',title:'Why polar has an extra r',
 concept:{q:R`Where does the extra factor \(r\) in \(dA=r\,dr\,d\theta\) come from?`,
  rubric:['A small polar "rectangle" between r and r+dr and between theta and theta+dtheta has radial side dr and arc side r dtheta, so its area is about r dr dtheta.','The arc length grows with the distance from the origin (arc = r times the angle), so the pieces are not all the same size; the factor r accounts for that.','Forgetting r (writing dr dtheta) is the common mistake; it would treat every piece as the same size.'],
  model:R`<p>A small piece of the plane between radii \(r\) and \(r+dr\) and angles \(\theta\) and \(\theta+d\theta\) is almost a rectangle. Its radial side is \(dr\) and its curved side is an arc of length \(r\,d\theta\), so its area is \(r\,dr\,d\theta\).</p><p>The factor \(r\) is there because equal angle steps sweep out longer arcs farther from the origin. Writing just \(dr\,d\theta\) treats every piece as the same size, which is the usual mistake.</p>`},
 app:{source:'Practice',
  prompt:R`Evaluate \(\displaystyle\iint_D(3x+y)\,dA\), where \(D\) is the region in the first quadrant inside the circle \(x^2+y^2=9\) between the lines \(y=x\) and \(x=0\). Give the exact value.`,
  parts:[{k:'v',label:R`value:`,kind:'number',ans:27-9*Math.SQRT2,sol:'27-9sqrt(2)',placeholder:'exact'}],
  solution:R`The region is a sector: \(0\le r\le3\) and \(\dfrac\pi4\le\theta\le\dfrac\pi2\) (the line \(y=x\) is \(\theta=\pi/4\), the line \(x=0\) is \(\theta=\pi/2\)).<br>
\(\displaystyle\int_{\pi/4}^{\pi/2}\!\int_0^3(3r\cos\theta+r\sin\theta)\,r\,dr\,d\theta=9\int_{\pi/4}^{\pi/2}(3\cos\theta+\sin\theta)\,d\theta=9\bigl[3\sin\theta-\cos\theta\bigr]_{\pi/4}^{\pi/2}\)<br>
\(=9\Bigl[3-\Bigl(\dfrac{3\sqrt2}{2}-\dfrac{\sqrt2}{2}\Bigr)\Bigr]=9(3-\sqrt2)=27-9\sqrt2\).`}},

{id:'d-polar-volume',topic:'dbl',title:'Spotting a polar integral',
 concept:{q:R`How can you tell, from the region and from the integrand, that polar coordinates will make a double integral easier?`,
  rubric:['Region: a disk, ring, sector, or other region bounded by circles centered at the origin or by lines through the origin; in polar the limits become constants.','Integrand: it involves x^2 + y^2 (or x and y only in that combination), which becomes r^2.','Remember to convert dA to r dr dtheta.'],
  model:R`<p>Look for circular symmetry. If the region is a disk, ring, or sector (circles about the origin, lines through the origin), the polar limits are constants. If the integrand contains \(x^2+y^2\), it becomes \(r^2\) and simplifies.</p><p>When either one shows up, switch: \(x=r\cos\theta\), \(y=r\sin\theta\), \(dA=r\,dr\,d\theta\).</p>`},
 app:{source:'Practice',
  prompt:R`Find the volume of the solid under the surface \(z=9-x^2-y^2\) and above the disk \(x^2+y^2\le4\) in the \(xy\)-plane. Give the exact value.`,
  parts:[{k:'v',label:R`volume:`,kind:'number',ans:28*Math.PI,sol:'28pi',placeholder:'exact'}],
  solution:R`Both the disk and \(x^2+y^2\) point to polar. On the disk \(z=9-r^2\ge5\gt0\), so the integral is the volume.<br>
\(V=\displaystyle\int_0^{2\pi}\!\int_0^2(9-r^2)\,r\,dr\,d\theta=2\pi\Bigl[\dfrac{9r^2}{2}-\dfrac{r^4}{4}\Bigr]_0^2=2\pi(18-4)=28\pi\).`}},

{id:'d-polar-area',topic:'dbl',title:'Area between polar curves',
 concept:{q:R`How does \(\iint_D 1\,dA\) in polar coordinates lead to the area formula \(\tfrac12\int f(\theta)^2\,d\theta\)? How do you find the \(\theta\) limits when two curves meet?`,
  rubric:['Area = double integral of 1 dA = integral over theta of the integral from 0 to f(theta) of r dr; the inner integral gives f(theta)^2 / 2.','For a region between two curves, the inner limits run from the inner curve to the outer curve, so the area is the integral of (outer^2 - inner^2)/2.','The theta limits are where the curves intersect: set the two r-expressions equal and solve for theta (check which curve is outside between those angles).'],
  model:R`<p>Area is \(\iint_D 1\,dA=\int\!\int r\,dr\,d\theta\). The inner integral \(\int_0^{f(\theta)}r\,dr=\tfrac12f(\theta)^2\), which is the formula. Between two curves the inner integral runs from the inner curve to the outer one, giving \(\tfrac12\int(r_{\text{out}}^2-r_{\text{in}}^2)\,d\theta\).</p><p>The \(\theta\) limits are the angles where the curves cross: set the two expressions for \(r\) equal and solve for \(\theta\). Then check which curve is farther out between those angles.</p>`},
 app:{source:'Practice',
  prompt:R`Find the area of the region inside the circle \(r=2\cos\theta\) and outside the circle \(r=1\). First give the \(\theta\) limits where the circles meet (use the symmetric pair), then the exact area.`,
  parts:[{k:'t0',label:R`lower \(\theta\) limit:`,kind:'number',ans:-Math.PI/3,sol:'-pi/3',placeholder:'exact'},
   {k:'t1',label:R`upper \(\theta\) limit:`,kind:'number',ans:Math.PI/3,sol:'pi/3',placeholder:'exact'},
   {k:'a',label:R`area:`,kind:'number',ans:Math.PI/3+Math.sqrt(3)/2,sol:'pi/3+sqrt(3)/2',placeholder:'exact'}],
  solution:R`The circles meet where \(2\cos\theta=1\), so \(\cos\theta=\tfrac12\) and \(\theta=\pm\dfrac\pi3\). Between those angles \(2\cos\theta\ge1\), so the big circle is the outer curve.<br>
\(A=\displaystyle\int_{-\pi/3}^{\pi/3}\!\int_1^{2\cos\theta}r\,dr\,d\theta=\dfrac12\int_{-\pi/3}^{\pi/3}(4\cos^2\theta-1)\,d\theta=\dfrac12\int_{-\pi/3}^{\pi/3}(1+2\cos2\theta)\,d\theta\)<br>
\(=\dfrac12\bigl[\theta+\sin2\theta\bigr]_{-\pi/3}^{\pi/3}=\dfrac12\Bigl(\dfrac{2\pi}{3}+\sqrt3\Bigr)=\dfrac\pi3+\dfrac{\sqrt3}{2}\).`}},

{id:'d-avg-charge',topic:'dbl',title:'Average value and total charge',
 concept:{q:R`What is the average value of \(f\) over a region \(D\), and why is it \(\frac{1}{A(D)}\iint_D f\,dA\)? What does integrating a density over a region give you?`,
  rubric:['The integral of f over D adds up f times area; dividing by the area of D gives the "per unit area" value, the height of a flat surface with the same volume.','Average value = (1 / area of D) times the double integral of f.','A density (charge, mass per unit area) integrated over a region gives the total amount: density times area, summed over the region.'],
  model:R`<p>\(\iint_D f\,dA\) adds up \(f\) times area. Dividing by the area of \(D\) gives \(f_{\text{ave}}=\dfrac{1}{A(D)}\iint_Df\,dA\): the constant height of a flat roof over \(D\) that encloses the same volume.</p><p>If \(f\) is a density (charge or mass per unit area), then density times area is an amount, so integrating it over \(D\) gives the total charge or total mass. No division this time.</p>`},
 app:{source:'Practice',
  prompt:R`(a) Find the average value of \(f(x,y)=2xy\) over the triangle with vertices \((0,0)\), \((2,0)\), \((2,4)\).<br>(b) A plate occupies \([0,3]\times[0,2]\) (meters) and has charge density \(\sigma(x,y)=x+2y\) coulombs per square meter. Find the total charge.`,
  parts:[{k:'avg',label:R`(a) average value:`,kind:'number',ans:4,sol:'4'},
   {k:'q',label:R`(b) total charge:`,kind:'number',ans:21,sol:'21',after:'C'}],
  solution:R`(a) The triangle is \(0\le x\le2\), \(0\le y\le2x\), with area \(\tfrac12\cdot2\cdot4=4\). \(\displaystyle\iint 2xy\,dA=\int_0^2 x\,(2x)^2\,dx=4\int_0^2x^3\,dx=16\). Average \(=16/4=4\).<br>
(b) \(Q=\displaystyle\int_0^3\!\int_0^2(x+2y)\,dy\,dx=\int_0^3(2x+4)\,dx=9+12=21\) coulombs.`}},

{id:'d-com',topic:'dbl',title:'Moments and center of mass',
 concept:{q:R`What do the moments \(M_x\) and \(M_y\) of a lamina measure, and why is \(\bar x=M_y/m\) and not \(M_x/m\)?`,
  rubric:['Moment about an axis = the sum of (distance from that axis) times (mass). M_x = integral of y rho dA (distance from the x-axis is y), M_y = integral of x rho dA (distance from the y-axis is x).','The center of mass is the balance point: the x-coordinate is the mass-weighted average of x, which uses distances from the y-axis.','So x-bar = M_y / m and y-bar = M_x / m; the subscript names the axis, not the coordinate.'],
  model:R`<p>A moment about an axis adds up distance from that axis times mass. Distance from the \(x\)-axis is \(y\), so \(M_x=\iint y\rho\,dA\). Distance from the \(y\)-axis is \(x\), so \(M_y=\iint x\rho\,dA\).</p><p>The balance point's \(x\)-coordinate is the mass-weighted average of \(x\), so \(\bar x=\dfrac{\iint x\rho\,dA}{m}=\dfrac{M_y}{m}\). The subscript names the axis, not the coordinate, which is why \(\bar x\) pairs with \(M_y\).</p>`},
 app:{source:'Practice',
  prompt:R`A lamina occupies the triangle with vertices \((0,0)\), \((1,0)\), \((0,1)\) and has density \(\rho(x,y)=x\). Find its mass and its center of mass \((\bar x,\bar y)\).`,
  parts:[{k:'m',label:R`mass \(m=\)`,kind:'number',ans:1/6,sol:'1/6'},
   {k:'xb',label:R`\(\bar x=\)`,kind:'number',ans:1/2,sol:'1/2'},
   {k:'yb',label:R`\(\bar y=\)`,kind:'number',ans:1/4,sol:'1/4'}],
  solution:R`The triangle is \(0\le x\le1\), \(0\le y\le1-x\).<br>
\(m=\displaystyle\int_0^1\!\int_0^{1-x}x\,dy\,dx=\int_0^1x(1-x)\,dx=\dfrac16\).<br>
\(M_y=\displaystyle\iint x\cdot x\,dA=\int_0^1x^2(1-x)\,dx=\dfrac1{12}\), so \(\bar x=\dfrac{1/12}{1/6}=\dfrac12\).<br>
\(M_x=\displaystyle\iint y\cdot x\,dA=\int_0^1x\dfrac{(1-x)^2}{2}\,dx=\dfrac1{24}\), so \(\bar y=\dfrac{1/24}{1/6}=\dfrac14\).`}},

{id:'d-sign-map',topic:'dbl',title:'Reading signs from a contour map',
 concept:{q:R`How can you tell the sign of \(\iint_D f\,dA\) (or of a line integral \(\int_C f\,ds\)) from a contour map of \(f\), without computing anything?`,
  rubric:['Read the sign of f on the region from the labeled contour levels: the integral adds f times area (or f times arc length), so where f is positive it contributes positively and where negative, negatively.','Compare how much of the region lies where f is positive versus negative, weighted by size of the values; if one sign clearly dominates, that is the sign of the integral.','If the region is balanced by symmetry (positive and negative parts cancel exactly), the integral is zero.'],
  model:R`<p>The integral adds up \(f\) times a small area (or arc length). Use the labeled levels to see where \(f\) is positive and where it is negative. If the region sits entirely where \(f\gt0\), the integral is positive, and where \(f\lt0\), negative.</p><p>If the region straddles both signs, compare how much of it lies on each side and how large the values get there. Equal and opposite contributions, usually from a symmetry, give zero.</p>`},
 app:{source:'Practice (adapted from Fall 2024 Midterm 2 · Problem 9)',
  prompt:R`The figure is a contour map of a function \(f(x,y)\), with the level of each curve labeled (orange curves are positive levels, blue are negative, gray is level 0). The shaded disks are \(D_1\), \(D_2\), \(D_3\), and \(C\) is the boundary circle of \(D_3\). Decide the sign of each integral without computing it.`,
  fig:signFig,
  parts:[{k:'s1',label:R`\(\displaystyle\iint_{D_1}f\,dA\) is`,kind:'choice',options:['positive','negative','zero'],ans:0},
   {k:'s2',label:R`\(\displaystyle\iint_{D_2}f\,dA\) is`,kind:'choice',options:['positive','negative','zero'],ans:2},
   {k:'s3',label:R`\(\displaystyle\iint_{D_3}f\,dA\) is`,kind:'choice',options:['positive','negative','zero'],ans:1},
   {k:'s4',label:R`\(\displaystyle\int_{C}f\,ds\) is`,kind:'choice',options:['positive','negative','zero'],ans:1}],
  solution:R`The map is \(f=x^2-y^2\): positive to the left and right of the origin, negative above and below, zero on the lines \(y=\pm x\).<br>
\(D_1\) is centered at \((2,0)\) and stays where \(x^2\gt y^2\): positive (exactly \(4\pi\)).<br>
\(D_2\) is centered at the origin and is symmetric under swapping \(x\) and \(y\), which swaps the positive and negative parts: they cancel, so the integral is zero.<br>
\(D_3\) is centered at \((0,2)\) and stays where \(y^2\gt x^2\): negative (exactly \(-4\pi\)).<br>
On \(C\) we have \(y\ge1\) and \(|x|\le1\), so \(y^2\ge x^2\) and \(f\le0\) all the way around (the circle lies in the blue region): \(\int_Cf\,ds\lt0\). Exactly, with \(x=\cos t\), \(y=2+\sin t\), \(ds=dt\): \(\int_0^{2\pi}(\cos^2t-(2+\sin t)^2)\,dt=-8\pi\).`}}
);
})();
