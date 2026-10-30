/* Midterm 2 gauntlet items, vector fields and work (MATH 212, Fall 2026: Stewart 16.1 to 16.3: fields, work, the conservative test, potential functions, and the Fundamental Theorem for line integrals).
   Sources: "Practice" problems written for this bank.
   Format: see the header of assets/gauntlet.js. */
window.GAUNTLET_M2=window.GAUNTLET_M2||[];
(function(){
const R=String.raw;
const C={a:'#d97706',b:'#2563eb',c:'#16a34a',d:'#7c3aed',e:'#db2777',ink:'#57534e'};
const YN=['Yes, it is conservative','No, it is not conservative'];
const SIGN=['positive','negative','zero'];

/* ---------------- figures */
const rotF=(x,y)=>[-y,x];
const signFig={style:'max-width:420px',opts:{xmin:-2.6,xmax:2.6,ymin:-2.6,ymax:2.6},
  draw(p){
    p.field(rotF,{step:1,scale:0.25,color:C.a});
    p.param(t=>[2*Math.cos(t),2*Math.sin(t)],0,Math.PI,{color:C.d,width:2.6,arrow:true});
    p.param(t=>[-2+4*t,1],0,1,{color:C.d,width:2.6,arrow:true});
    p.param(t=>[2*t,2*t],0,1,{color:C.d,width:2.6,arrow:true});
    p.point([2,0],{color:C.d,r:4});p.point([-2,1],{color:C.d,r:4});p.point([0,0],{color:C.d,r:4});
    const bold='600 15px -apple-system,Segoe UI,sans-serif';
    p.text([-1.55,1.95],'C₁',{color:C.d,font:bold});p.text([-0.95,1.28],'C₂',{color:C.d,font:bold});p.text([0.62,0.22],'C₃',{color:C.d,font:bold});
  }};

window.GAUNTLET_M2.push(
{id:'f-sketch',topic:'vf',title:'Sketching a vector field',
 concept:{q:R`How do you sketch a vector field by hand, and what does it mean that the tail of each arrow sits at the point?`,
  rubric:['The field assigns a vector \(\mathbf F(x,y)\) to every point, so you pick sample points and evaluate \(\mathbf F\) at each one','Each arrow is drawn with its tail at the sample point (not at the origin), pointing along \(\mathbf F\) there','Arrow length shows the size \(|\mathbf F|\); look at the pattern of directions and lengths across several points'],
  model:R`<p>A vector field gives a vector \(\mathbf F(x,y)\) at every point, so you choose a grid of sample points, compute \(\mathbf F\) at each, and draw that vector as an arrow.</p><p>The tail of the arrow sits at the sample point itself, not at the origin: the arrow shows what the field does <b>at that point</b>. Its direction is the direction of \(\mathbf F\) there and its length is proportional to \(|\mathbf F|\). A few points in each region, plus the points on the axes, are usually enough to see the pattern.</p>`},
 app:{source:'Practice',
  prompt:R`Let \(\mathbf F(x,y)=\langle y,\,-x\rangle\). Evaluate \(\mathbf F\) at the points below (enter each as a vector), then describe the picture.`,
  fig:{style:'max-width:360px',opts:{xmin:-3,xmax:3,ymin:-3,ymax:3},draw(p,solved){if(solved)p.field((x,y)=>[y,-x],{step:1,scale:0.3,color:C.a});}},
  parts:[{k:'a',label:R`\(\mathbf F(1,0)\)`,kind:'vector',ans:[0,-1],sol:'<0,-1>'},
   {k:'b',label:R`\(\mathbf F(0,1)\)`,kind:'vector',ans:[1,0],sol:'<1,0>'},
   {k:'c',label:R`\(\mathbf F(-2,0)\)`,kind:'vector',ans:[0,2],sol:'<0,2>'},
   {k:'d',label:'The overall picture',kind:'choice',options:['arrows circle the origin clockwise, longer farther out','arrows circle counterclockwise, longer farther out','arrows point straight away from the origin','all arrows are the same'],ans:0}],
  solution:R`<p>Substitute each point: \(\mathbf F(1,0)=\langle 0,-1\rangle\), \(\mathbf F(0,1)=\langle 1,0\rangle\), \(\mathbf F(-2,0)=\langle 0,2\rangle\).</p><p>At \((1,0)\) the arrow points down, at \((0,1)\) it points right, and at \((-2,0)\) it points up. Going from the right of the origin to the top to the left, the arrows turn <b>clockwise</b>. Also \(|\mathbf F|=\sqrt{x^2+y^2}\), so arrows grow longer as you move away from the origin, and \(\mathbf F\cdot\langle x,y\rangle=0\) says every arrow is perpendicular to the position vector, which is why they circle.</p>`}},

{id:'f-conservative',topic:'vf',title:'The conservative test',
 concept:{q:R`State the test for a conservative field \(\mathbf F=\langle P,Q\rangle\) in the plane. Why must \(P_y=Q_x\) hold for a conservative field, and when is it enough?`,
  rubric:['Necessary: if \(\mathbf F=\nabla f\) then \(P=f_x\) and \(Q=f_y\), so \(P_y=f_{xy}\) and \(Q_x=f_{yx}\), which are equal by Clairaut (continuous second partials)','Sufficient only when the domain is simply connected (no holes), for example all of the plane; \(P_y=Q_x\) on a domain with a hole is not enough','If \(P_y\ne Q_x\) anywhere, the field is not conservative']
  ,model:R`<p>If \(\mathbf F=\nabla f\), then \(P=f_x\) and \(Q=f_y\). Differentiating gives \(P_y=f_{xy}\) and \(Q_x=f_{yx}\), and these agree by Clairaut's theorem when the second partials are continuous. So a conservative field must satisfy \(P_y=Q_x\), and one failure of that equation proves the field is not conservative.</p><p>The converse needs a condition on the domain: if \(P_y=Q_x\) on a <b>simply connected</b> region (no holes, like the whole plane), then \(\mathbf F\) is conservative. With a hole, the test can pass and the field can still fail to be conservative.</p>`},
 app:{source:'Practice',
  prompt:R`Let \(\mathbf F=\langle 3x^2y+2y,\ x^3+2x+e^y\rangle\) and \(\mathbf G=\langle xy,\ x^2+y\rangle\), both defined on the whole plane. Test each, and find a potential function for the one that is conservative.`,
  parts:[{k:'a',label:R`Is \(\mathbf F\) conservative?`,kind:'choice',options:YN,ans:0},
   {k:'b',label:R`A potential function \(f\) with \(\nabla f=\mathbf F\)`,kind:'custom',sol:'x^3y+2xy+e^y',placeholder:'f(x,y)',check:v=>checkExprUpToConstant(v,'x^3*y+2*x*y+e^y',['x','y'])},
   {k:'c',label:R`Is \(\mathbf G\) conservative?`,kind:'choice',options:YN,ans:1}],
  solution:R`<p>For \(\mathbf F\): \(P_y=3x^2+2\) and \(Q_x=3x^2+2\). They match on the whole plane, which is simply connected, so \(\mathbf F\) is conservative.</p><p>Find \(f\): integrate \(f_x=3x^2y+2y\) in \(x\) to get \(f=x^3y+2xy+g(y)\). Then \(f_y=x^3+2x+g'(y)\) must equal \(x^3+2x+e^y\), so \(g'(y)=e^y\) and \(f=x^3y+2xy+e^y\) (plus any constant).</p><p>For \(\mathbf G\): \(P_y=x\) but \(Q_x=2x\). They differ (for example at \(x=1\)), so \(\mathbf G\) is not conservative.</p>`}},

{id:'f-potential-3d',topic:'vf',title:'A potential function in space',
 concept:{q:R`Explain how you recover a potential function \(f\) from a field \(\mathbf F=\langle P,Q,R\rangle\) in space, and how you check your answer.`,
  rubric:['Integrate \(P=f_x\) with respect to \(x\), adding an unknown function of the other variables (\(g(y,z)\)), then match \(f_y\) and \(f_z\) to \(Q\) and \(R\) to pin that function down step by step','Check by taking the gradient: \(f_x,f_y,f_z\) must give back \(P,Q,R\) exactly','Conservative requires the curl to be zero first (\(R_y=Q_z\), \(P_z=R_x\), \(Q_x=P_y\)); a potential is only determined up to a constant']
  ,model:R`<p>First confirm \(\mathbf F\) can be conservative: the curl must vanish, meaning \(R_y=Q_z\), \(P_z=R_x\), \(Q_x=P_y\). Then integrate \(f_x=P\) in \(x\), which gives \(f\) plus an unknown \(g(y,z)\) in place of the constant. Differentiate in \(y\) and compare with \(Q\) to find \(g_y\), then do the same with \(z\) and \(R\) until \(g\) is known.</p><p>Always check at the end: compute \(\nabla f\) and confirm it is exactly \(\mathbf F\). The potential is unique only up to an added constant.</p>`},
 app:{source:'Practice',
  prompt:R`Let \(\mathbf F=\langle 2xy+z^2,\ x^2,\ 2xz+1\rangle\).`,
  parts:[{k:'a',label:R`Is \(\mathbf F\) conservative?`,kind:'choice',options:YN,ans:0},
   {k:'b',label:R`A potential function \(f(x,y,z)\)`,kind:'custom',sol:'x^2y+xz^2+z',placeholder:'f(x,y,z)',check:v=>checkExprUpToConstant(v,'x^2*y+x*z^2+z',['x','y','z'])}],
  solution:R`<p>Curl check: \(R_y=0=Q_z\), \(P_z=2z=R_x\), \(Q_x=2x=P_y\). All three match, so \(\mathbf F\) is conservative.</p><p>Integrate \(f_x=2xy+z^2\): \(f=x^2y+xz^2+g(y,z)\). Then \(f_y=x^2+g_y\) must equal \(x^2\), so \(g_y=0\) and \(g=h(z)\). Then \(f_z=2xz+h'(z)\) must equal \(2xz+1\), so \(h'=1\), \(h=z\).</p><p>\(f=x^2y+xz^2+z\). Check: \(\nabla f=\langle 2xy+z^2,\ x^2,\ 2xz+1\rangle\). It matches.</p>`}},

{id:'f-work-param',topic:'vf',title:'Work along a curve',
 concept:{q:R`What does \(\int_C\mathbf F\cdot d\mathbf r\) measure, and how do you compute it from a parametrization \(\mathbf r(t)\)?`,
  rubric:['It is the work done by the force \(\mathbf F\) moving along \(C\): add up the component of \(\mathbf F\) along the direction of motion (\(\mathbf F\cdot\mathbf T\,ds\)) over the curve','Parametrize, substitute \(x(t),y(t)\) into \(\mathbf F\), and integrate \(\mathbf F(\mathbf r(t))\cdot\mathbf r{\prime}(t)\,dt\) over the parameter interval','Only the part of \(\mathbf F\) along the path counts; the direction of travel matters']
  ,model:R`<p>The integral \(\int_C\mathbf F\cdot d\mathbf r\) is the <b>work</b> done by the force \(\mathbf F\) along \(C\). Each small step \(d\mathbf r\) contributes \(\mathbf F\cdot d\mathbf r\), so only the component of \(\mathbf F\) along the direction of motion counts, and the total is the sum over the curve.</p><p>To compute it, parametrize \(C\) by \(\mathbf r(t)\), \(a\le t\le b\), substitute into \(\mathbf F\), and evaluate \(\int_a^b\mathbf F(\mathbf r(t))\cdot\mathbf r{\prime}(t)\,dt\). The direction in which \(t\) increases is the direction of travel.</p>`},
 app:{source:'Practice',
  prompt:R`Find the work done by \(\mathbf F=\langle xy,\ y^2\rangle\) along the parabola \(y=x^2\) from \((0,0)\) to \((1,1)\). Exact value.`,
  parts:[{k:'w',label:'Work',kind:'number',ans:7/12,sol:'7/12'}],
  solution:R`<p>Parametrize \(\mathbf r(t)=\langle t,t^2\rangle\), \(0\le t\le1\), so \(\mathbf r{\prime}(t)=\langle 1,2t\rangle\).</p><p>\(\mathbf F(\mathbf r(t))=\langle t\cdot t^2,\ t^4\rangle=\langle t^3,t^4\rangle\), and the dot product with \(\mathbf r{\prime}\) is \(t^3+2t^5\).</p><p>\(\displaystyle W=\int_0^1(t^3+2t^5)\,dt=\tfrac14+\tfrac13=\tfrac7{12}\).</p>`}},

{id:'f-work-segment',topic:'vf',title:'Work along a segment, and reversing it',
 concept:{q:R`How do you parametrize the segment from a point \(P\) to a point \(Q\)? What happens to the work if you traverse the same segment from \(Q\) to \(P\), and what happens to a scalar line integral \(\int_C f\,ds\)?`,
  rubric:['\(\mathbf r(t)=P+t(Q-P)\) for \(0\le t\le1\), so \(\mathbf r{\prime}=Q-P\) is constant','Reversing the direction flips the sign of the work \(\int_C\mathbf F\cdot d\mathbf r\), since \(d\mathbf r\) changes sign','A scalar line integral \(\int_C f\,ds\) does not change, because \(ds\) is a length and stays positive']
  ,model:R`<p>Use \(\mathbf r(t)=\mathbf P+t(\mathbf Q-\mathbf P)\), \(0\le t\le1\). It starts at \(P\), ends at \(Q\), and \(\mathbf r{\prime}=\mathbf Q-\mathbf P\).</p><p>Going from \(Q\) to \(P\) reverses every tangent vector, so \(\mathbf F\cdot d\mathbf r\) changes sign and the <b>work changes sign</b>. A scalar line integral \(\int_C f\,ds\) uses the arc length element \(ds\), which is always positive, so it does <b>not</b> change when the direction is reversed.</p>`},
 app:{source:'Practice',
  prompt:R`Let \(\mathbf F=\langle y,\ z,\ x\rangle\). Find the work done by \(\mathbf F\) along the straight segment from \((1,0,0)\) to \((2,1,3)\), and then along the same segment traversed from \((2,1,3)\) back to \((1,0,0)\).`,
  parts:[{k:'a',label:R`Work from \((1,0,0)\) to \((2,1,3)\)`,kind:'number',ans:6.5,sol:'13/2'},
   {k:'b',label:R`Work from \((2,1,3)\) to \((1,0,0)\)`,kind:'number',ans:-6.5,sol:'-13/2'}],
  solution:R`<p>\(\mathbf r(t)=\langle 1+t,\ t,\ 3t\rangle\), \(0\le t\le1\), so \(\mathbf r{\prime}=\langle 1,1,3\rangle\).</p><p>\(\mathbf F(\mathbf r(t))=\langle t,\ 3t,\ 1+t\rangle\), and \(\mathbf F\cdot\mathbf r{\prime}=t+3t+3(1+t)=7t+3\).</p><p>\(\displaystyle W=\int_0^1(7t+3)\,dt=\tfrac72+3=\tfrac{13}2\).</p><p>Traversing the segment backwards reverses \(d\mathbf r\), so the work is \(-\tfrac{13}2\).</p>`}},

{id:'f-sign-picture',topic:'vf',title:'The sign of the work from a picture',
 concept:{q:R`How can you tell whether the work \(\int_C\mathbf F\cdot d\mathbf r\) is positive, negative, or zero just by looking at a picture of the field and an oriented curve?`,
  rubric:['Walk along \(C\) in its direction and compare \(\mathbf F\) with the direction of travel (the tangent) at each point: the work adds up \(\mathbf F\cdot\mathbf T\)','Mostly with the motion gives positive work, mostly against it gives negative, perpendicular everywhere gives zero (or with and against that cancel)','Arrow length matters: a few long arrows against the motion can outweigh many short ones with it']
  ,model:R`<p>Walk along the curve in its direction. At each point compare the arrow of \(\mathbf F\) with the direction you are moving: the work adds up \(\mathbf F\cdot\mathbf T\,ds\). If the arrows mostly point along your motion the work is <b>positive</b>, if they mostly point against it the work is <b>negative</b>, and if they are perpendicular to the motion all the way, the work is <b>zero</b> (the same happens if the with and against parts cancel).</p><p>Length counts too: a few long arrows against the motion can beat many short arrows with it.</p>`},
 app:{source:'Practice',
  prompt:R`The field \(\mathbf F=\langle -y,\ x\rangle\) is drawn in orange. Three oriented curves are shown in purple: \(C_1\) is the upper half of the circle of radius 2 from \((2,0)\) to \((-2,0)\); \(C_2\) is the segment from \((-2,1)\) to \((2,1)\); \(C_3\) is the segment from \((0,0)\) to \((2,2)\). Decide the sign of \(\int_C\mathbf F\cdot d\mathbf r\) for each curve.`,
  fig:signFig,
  parts:[{k:'a',label:R`\(C_1\)`,kind:'choice',options:SIGN,ans:0},
   {k:'b',label:R`\(C_2\)`,kind:'choice',options:SIGN,ans:1},
   {k:'c',label:R`\(C_3\)`,kind:'choice',options:SIGN,ans:2}],
  solution:R`<p>\(C_1\): at \((2,0)\) the tangent is \(\langle 0,1\rangle\) and \(\mathbf F=\langle 0,2\rangle\); at \((0,2)\) the tangent is \(\langle -1,0\rangle\) and \(\mathbf F=\langle -2,0\rangle\). The field points along the motion everywhere, with \(\mathbf F\cdot\mathbf T=2\). The work is positive: \(2\cdot\text{length}=2\cdot2\pi=4\pi\).</p><p>\(C_2\): on \(y=1\) the field is \(\langle -1,x\rangle\) and the tangent is \(\langle 1,0\rangle\), so \(\mathbf F\cdot\mathbf T=-1\). The field works against the motion, so the work is negative: \(-1\cdot4=-4\).</p><p>\(C_3\): on \(y=x\) the field is \(\langle -x,x\rangle\), which is perpendicular to \(\langle 1,1\rangle\), so \(\mathbf F\cdot\mathbf T=0\) and the work is zero.</p>`}},

{id:'f-circulation',topic:'vf',title:'Work around a closed loop',
 concept:{q:R`Why does a nonzero value of \(\oint_C\mathbf F\cdot d\mathbf r\) around a closed curve prove that \(\mathbf F\) is not conservative?`,
  rubric:['If \(\mathbf F=\nabla f\), the work along a path depends only on the endpoints, \(f(B)-f(A)\)','On a closed curve the start and end points coincide, so a conservative field gives exactly 0','So one closed loop with a nonzero value shows no potential function exists']
  ,model:R`<p>For a conservative field \(\mathbf F=\nabla f\), the work along a path is \(f(\text{end})-f(\text{start})\), so it depends only on the endpoints. On a closed curve the start and end are the same point, so the work is \(0\).</p><p>Therefore a single closed loop with a nonzero work integral rules out a potential function: the field cannot be conservative.</p>`},
 app:{source:'Practice',
  prompt:R`Let \(\mathbf F=\langle -y,\ x\rangle\). Find the work done by \(\mathbf F\) around the unit circle, traversed once counterclockwise. Then decide whether \(\mathbf F\) is conservative.`,
  parts:[{k:'a',label:'Work around the unit circle (exact value)',kind:'number',ans:2*Math.PI,sol:'2pi'},
   {k:'b',label:R`Is \(\mathbf F\) conservative?`,kind:'choice',options:YN,ans:1}],
  solution:R`<p>\(\mathbf r(t)=\langle\cos t,\sin t\rangle\), \(0\le t\le2\pi\), \(\mathbf r{\prime}=\langle-\sin t,\cos t\rangle\). \(\mathbf F(\mathbf r(t))=\langle-\sin t,\cos t\rangle\), so \(\mathbf F\cdot\mathbf r{\prime}=\sin^2t+\cos^2t=1\) and \(W=\int_0^{2\pi}1\,dt=2\pi\).</p><p>The work around a closed loop is not zero, so \(\mathbf F\) cannot be a gradient field: it is not conservative. The test agrees: \(P_y=-1\ne1=Q_x\).</p>`}},

{id:'f-ftli',topic:'vf',title:'The Fundamental Theorem for line integrals',
 concept:{q:R`State the Fundamental Theorem for line integrals and explain why it is true. When does it let you skip parametrizing the curve?`,
  rubric:['If \(\mathbf F=\nabla f\) and \(C\) runs from \(\mathbf r(a)\) to \(\mathbf r(b)\), then \(\int_C\mathbf F\cdot d\mathbf r=f(\mathbf r(b))-f(\mathbf r(a))\), the potential at the end minus the potential at the start','Why: by the chain rule \(\frac{d}{dt}f(\mathbf r(t))=\nabla f\cdot\mathbf r{\prime}(t)\), so the integrand is a derivative and the one-variable Fundamental Theorem of Calculus gives the net change in \(f\)','It applies whenever the field is conservative: test it, find \(f\), then only the endpoints matter and the shape of the path is irrelevant']
  ,model:R`<p>If \(\mathbf F=\nabla f\) and \(C\) is traced by \(\mathbf r(t)\), \(a\le t\le b\), then \(\int_C\mathbf F\cdot d\mathbf r=f(\mathbf r(b))-f(\mathbf r(a))\): the potential at the end minus the potential at the start.</p><p>The reason is the chain rule: \(\frac{d}{dt}f(\mathbf r(t))=f_x x{\prime}+f_y y{\prime}=\nabla f(\mathbf r(t))\cdot\mathbf r{\prime}(t)\). So the integrand \(\mathbf F(\mathbf r(t))\cdot\mathbf r{\prime}(t)\) is the derivative of \(f(\mathbf r(t))\), and integrating a derivative gives the net change. Whenever the field passes the conservative test and you can find \(f\), you never need the parametrization, only the two endpoints.</p>`},
 app:{source:'Practice',
  prompt:R`Let \(\mathbf F=\langle 2xy^3,\ 3x^2y^2+1\rangle\) and let \(C\) be the curve \(\mathbf r(t)=\langle t^2+1,\ \sin(\pi t/2)\rangle\), \(0\le t\le1\). Find \(\int_C\mathbf F\cdot d\mathbf r\).`,
  parts:[{k:'a',label:R`Is \(\mathbf F\) conservative?`,kind:'choice',options:YN,ans:0},
   {k:'b',label:R`A potential function \(f\) with \(\nabla f=\mathbf F\)`,kind:'custom',sol:'x^2y^3+y',placeholder:'f(x,y)',check:v=>checkExprUpToConstant(v,'x^2*y^3+y',['x','y'])},
   {k:'c',label:R`\(\int_C\mathbf F\cdot d\mathbf r\)`,kind:'number',ans:5,sol:'5'}],
  solution:R`<p>Test: \(P_y=6xy^2\) and \(Q_x=6xy^2\). They match on the whole plane, so \(\mathbf F\) is conservative.</p><p>Integrate \(f_x=2xy^3\) in \(x\): \(f=x^2y^3+g(y)\). Then \(f_y=3x^2y^2+g'(y)\) must equal \(3x^2y^2+1\), so \(g'(y)=1\) and \(f=x^2y^3+y\).</p><p>The curve starts at \(\mathbf r(0)=(1,0)\) and ends at \(\mathbf r(1)=(2,1)\). By the Fundamental Theorem the work is \(f(2,1)-f(1,0)=(4+1)-0=5\). Substituting the sine into \(\mathbf F\cdot\mathbf r{\prime}\) would have worked too, but it is a much longer road to the same number.</p>`}},

{id:'f-path-indep',topic:'vf',title:'Path independence and closed loops',
 concept:{q:R`What does it mean for \(\int_C\mathbf F\cdot d\mathbf r\) to be independent of path? Explain why that is the same as saying the integral around every closed curve is zero.`,
  rubric:['Independent of path: any two curves with the same start and the same end give the same value of the integral','If it is path independent, a closed loop from \(A\) back to \(A\) gives the same value as the constant path that never moves, which is 0 (or: split the loop into two paths from \(A\) to \(B\) and note one is reversed, so they cancel)','Conversely, if every closed loop gives 0, follow one path from \(A\) to \(B\) and the other back; the total is 0, so the two paths agree. Conservative fields are exactly the path independent ones']
  ,model:R`<p>Path independence means the value depends only on where the curve starts and where it ends: any two curves from \(A\) to \(B\) give the same number.</p><p>The two statements are the same fact. Take two paths \(C_1\) and \(C_2\) from \(A\) to \(B\). Going out along \(C_1\) and back along \(C_2\) reversed makes a closed loop, and its integral is \(\int_{C_1}-\int_{C_2}\). So that loop gives 0 exactly when the two paths agree. Conservative fields are exactly the path independent ones, because \(\int_C\nabla f\cdot d\mathbf r=f(B)-f(A)\).</p>`},
 app:{source:'Practice',
  prompt:R`Let \(\mathbf F=\langle yz,\ xz,\ xy+2z\rangle\). Let \(C_1\) be the helix \(\mathbf r(t)=\langle\cos t,\ \sin t,\ t/\pi\rangle\), \(0\le t\le2\pi\), and let \(C_2\) be the vertical segment from the end of the helix straight back down to its start.`,
  parts:[{k:'a',label:R`A potential function \(f(x,y,z)\)`,kind:'custom',sol:'xyz+z^2',placeholder:'f(x,y,z)',check:v=>checkExprUpToConstant(v,'x*y*z+z^2',['x','y','z'])},
   {k:'b',label:R`\(\int_{C_1}\mathbf F\cdot d\mathbf r\)`,kind:'number',ans:4,sol:'4'},
   {k:'c',label:R`\(\int_{C_2}\mathbf F\cdot d\mathbf r\)`,kind:'number',ans:-4,sol:'-4'},
   {k:'d',label:R`The integral around the closed loop \(C_1\) followed by \(C_2\)`,kind:'number',ans:0,sol:'0'}],
  solution:R`<p>Curl check: \(R_y=x=Q_z\), \(P_z=y=R_x\), \(Q_x=z=P_y\), so \(\mathbf F\) is conservative. Integrate \(f_x=yz\): \(f=xyz+g(y,z)\). Then \(f_y=xz+g_y=xz\) gives \(g=h(z)\), and \(f_z=xy+h'(z)=xy+2z\) gives \(h=z^2\). So \(f=xyz+z^2\).</p><p>The helix starts at \(\mathbf r(0)=(1,0,0)\) and ends at \(\mathbf r(2\pi)=(1,0,2)\). \(\int_{C_1}=f(1,0,2)-f(1,0,0)=4-0=4\).</p><p>\(C_2\) runs from \((1,0,2)\) to \((1,0,0)\), so \(\int_{C_2}=0-4=-4\). The loop is closed, and \(4+(-4)=0\), as it must be for a conservative field.</p>`}},

{id:'f-hole',topic:'vf',title:'When the test passes but the field is not conservative',
 concept:{q:R`The field \(\mathbf F=\left\langle\frac{-y}{x^2+y^2},\frac{x}{x^2+y^2}\right\rangle\) satisfies \(P_y=Q_x\) everywhere it is defined, yet it is not conservative. Explain how that can happen, and what extra condition makes \(P_y=Q_x\) enough.`,
  rubric:['\(\mathbf F\) is undefined at the origin, so its domain is the plane with a hole, which is not simply connected','The test \(P_y=Q_x\) is necessary but only sufficient on a simply connected domain (connected, no holes); a loop around the hole can have nonzero work, here \(2\pi\) around the unit circle','On a region that avoids the hole, such as the right half plane \(x>0\), the field is conservative (a potential is \(\arctan(y/x)\), the polar angle)']
  ,model:R`<p>\(\mathbf F\) is not defined at the origin, so its domain is the plane with a hole punched in it. The test \(P_y=Q_x\) always holds for a conservative field, but it only <b>guarantees</b> one on a simply connected domain, where every loop can be shrunk to a point without leaving the domain. A loop around the origin cannot be, and the work around the unit circle is \(2\pi\ne0\), so no potential exists on the whole punctured plane.</p><p>Restrict to a simply connected piece that avoids the origin, such as the right half plane, and the test is enough: there \(\mathbf F=\nabla\theta\) with \(\theta=\arctan(y/x)\). The polar angle is the potential, and it fails globally because going once around the origin adds \(2\pi\) to it.</p>`},
 app:{source:'Practice',
  prompt:R`Let \(\mathbf F=\left\langle\frac{-y}{x^2+y^2},\ \frac{x}{x^2+y^2}\right\rangle\), defined for \((x,y)\ne(0,0)\).`,
  parts:[{k:'a',label:R`Does \(P_y=Q_x\) hold everywhere \(\mathbf F\) is defined?`,kind:'choice',options:['Yes','No'],ans:0},
   {k:'b',label:'Work around the unit circle, counterclockwise once (exact value)',kind:'number',ans:2*Math.PI,sol:'2pi'},
   {k:'c',label:R`Is \(\mathbf F\) conservative on the whole plane minus the origin?`,kind:'choice',options:YN,ans:1},
   {k:'d',label:R`Work from \((1,-1)\) to \((1,1)\) along any path that stays in the right half plane \(x>0\) (exact value)`,kind:'number',ans:Math.PI/2,sol:'pi/2'}],
  solution:R`<p>\(P_y=\frac{-(x^2+y^2)+2y^2}{(x^2+y^2)^2}=\frac{y^2-x^2}{(x^2+y^2)^2}\) and \(Q_x=\frac{(x^2+y^2)-2x^2}{(x^2+y^2)^2}=\frac{y^2-x^2}{(x^2+y^2)^2}\). They agree wherever \(\mathbf F\) is defined.</p><p>On the unit circle \(\mathbf r=\langle\cos t,\sin t\rangle\), \(x^2+y^2=1\), so \(\mathbf F=\langle-\sin t,\cos t\rangle\) and \(\mathbf F\cdot\mathbf r{\prime}=1\). The work is \(2\pi\), not 0, so \(\mathbf F\) is not conservative on the punctured plane: the origin is a hole and the domain is not simply connected.</p><p>The right half plane has no hole, and there \(f=\arctan(y/x)\) works: \(f_x=\frac{-y}{x^2+y^2}\), \(f_y=\frac{x}{x^2+y^2}\). So the work is \(\arctan(1)-\arctan(-1)=\frac\pi4+\frac\pi4=\frac\pi2\), for every path that stays in \(x>0\).</p>`}},

{id:'f-split',topic:'vf',title:'Nearly conservative: split off the gradient',
 concept:{q:R`A field fails the conservative test, but most of it looks like a gradient. How can you still use the Fundamental Theorem to shorten a work integral?`,
  rubric:['Write \(\mathbf F=\nabla f+\mathbf G\), where \(\nabla f\) is the conservative part and \(\mathbf G\) is the small leftover','The line integral is linear, so \(\int_C\mathbf F\cdot d\mathbf r=\big(f(\text{end})-f(\text{start})\big)+\int_C\mathbf G\cdot d\mathbf r\)','Only the leftover \(\mathbf G\) needs the parametrization, and the answer now depends on the path']
  ,model:R`<p>Split the field: \(\mathbf F=\nabla f+\mathbf G\), with \(\nabla f\) the part that is a gradient and \(\mathbf G\) what is left over. Line integrals are linear, so \(\int_C\mathbf F\cdot d\mathbf r=\int_C\nabla f\cdot d\mathbf r+\int_C\mathbf G\cdot d\mathbf r\).</p><p>The first piece is \(f(\text{end})-f(\text{start})\) by the Fundamental Theorem. Only the leftover needs a parametrization, and it is usually simple. Because \(\mathbf G\) is not conservative, the total does depend on the path.</p>`},
 app:{source:'Practice',
  prompt:R`Let \(\mathbf F=\langle 2xy,\ x^2+x\rangle\) and let \(C\) be the parabola \(y=x^2\) from \((0,0)\) to \((1,1)\).`,
  parts:[{k:'a',label:R`Is \(\mathbf F\) conservative?`,kind:'choice',options:YN,ans:1},
   {k:'b',label:R`\(\int_C\mathbf F\cdot d\mathbf r\) (exact value)`,kind:'number',ans:5/3,sol:'5/3'}],
  solution:R`<p>Test: \(P_y=2x\) but \(Q_x=2x+1\), so \(\mathbf F\) is not conservative.</p><p>Split: \(\mathbf F=\langle 2xy,x^2\rangle+\langle 0,x\rangle=\nabla(x^2y)+\langle 0,x\rangle\). The gradient part gives \(f(1,1)-f(0,0)=1\).</p><p>For the leftover, use \(\mathbf r(t)=\langle t,t^2\rangle\), \(\mathbf r{\prime}=\langle 1,2t\rangle\): \(\langle 0,t\rangle\cdot\langle 1,2t\rangle=2t^2\), and \(\int_0^1 2t^2\,dt=\frac23\).</p><p>Total: \(1+\frac23=\frac53\). Direct check: \(\mathbf F\cdot\mathbf r{\prime}=2t^3+2t(t^2+t)=4t^3+2t^2\), which integrates to \(1+\frac23\).</p>`}}
);
})();
