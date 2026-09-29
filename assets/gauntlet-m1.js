/* Midterm 1 gauntlet items (MATH 212, Fall 2026: Stewart 12.1 to 12.6, 13.1 to 13.4, 16.2, 14.1 to 14.6).
   Application problems come from the handwritten homework (Weeks 1 to 5); "Practice" marks a problem
   written to cover a midterm topic the homework skipped. Format: see the header of assets/gauntlet.js. */
(function(){
const R=String.raw;
const C={a:'#d97706',b:'#2563eb',c:'#16a34a',d:'#7c3aed',e:'#db2777',ink:'#57534e'};

/* ---------------- custom checkers */
/* a vector named with the pictured vectors a, u, v, w, where u = a - w and v = a + w (a and w independent) */
function linComb(ca,cw){return v=>{
  const s=cleanAns(v);if(!s)return {ok:false,err:'Empty answer'};
  let f;try{f=Expr.compile(s);}catch(e){return {ok:false,err:e.message};}
  for(const x of Expr.vars(Expr.parse(s)))if(!'auvw'.includes(x))return {ok:false,err:`Use only the vectors a, u, v, w (found "${x}")`};
  for(let k=0;k<6;k++){const A=Math.random()*4-2,W=Math.random()*4-2;const got=f({a:A,w:W,u:A-W,v:A+W});if(!Number.isFinite(got)||!near(got,ca*A+cw*W))return {ok:false};}
  return {ok:true};
};}
/* r(t) = <x,y,z> in t that stays on both surfaces F=0 and G=0 and actually moves */
function onBoth(F,G){return v=>{
  const s=cleanAns(v).replace(/^\(?\s*x\s*,\s*y\s*,\s*z\s*\)?\s*=\s*/,'');
  const parts=splitTop(stripBrackets(s)).map(p=>p.replace(/^[xyz]\s*(\(t\))?\s*=\s*/,''));
  if(parts.length!==3)return {ok:false,err:'Expected 3 components separated by commas'};
  let fs;try{fs=parts.map(p=>Expr.compile(p));}catch(e){return {ok:false,err:e.message};}
  const pts=[];for(let k=0;k<16;k++){const t=0.1+k*0.39;const p=fs.map(f=>f({t}));if(p.every(Number.isFinite))pts.push(p);}
  if(pts.length<8)return {ok:false};
  if(!pts.every(p=>near(F(...p),0,1e-6)&&near(G(...p),0,1e-6)))return {ok:false};
  return {ok:pts.some(p=>norm(vsub(p,pts[0]))>0.1)};
};}
const angleDeg=(u,v)=>Math.acos(clamp(dot(u,v)/(norm(u)*norm(v)),-1,1))*180/Math.PI;
function dirNear(ref,deg){return v=>{const r=parseVector(v,2);if(r.err)return {ok:false,err:r.err};if(vzero(r.v))return {ok:false};return {ok:angleDeg(r.v,ref)<=deg};};}
function perpNear(ref,deg){return v=>{const r=parseVector(v,2);if(r.err)return {ok:false,err:r.err};if(vzero(r.v))return {ok:false};return {ok:Math.abs(angleDeg(r.v,ref)-90)<=deg};};}
function dotCounter(v){const r=parseVector(v,3);if(r.err)return {ok:false,err:r.err};const c=r.v;return {ok:Math.abs(c[0])<1e-9&&!(near(c[1],1)&&Math.abs(c[2])<1e-9)};}

/* ---------------- figures */
const contourF=(x,y)=>x**3-3*x+x*y+y*y;   /* reproduces the Week 5 map exactly: 0 through A, 3 at y=sqrt3 on the y-axis, 9 at y=3 */
const mapFig={style:'aspect-ratio:4.85/6.5;max-width:380px',opts:{xmin:-2.6,xmax:2.25,ymin:-2.9,ymax:3.6},
  draw(p,solved){
    p.contour(contourF,[-6,-3,0,3,6,9,12,15],{color:'#44403c',width:1.3});
    if(solved){p.vector([1,-2],[1-0.5,-2-0.75],{color:C.c,label:'∇f(A)',labelOffset:[-52,14]});p.vector([-2,2],[-2+0.14,2-0.8],{color:C.b,dash:[5,4]});p.vector([-2,2],[-2-0.14,2+0.8],{color:C.b,dash:[5,4]});}
    p.point([1,-2],{label:'A',labelOffset:[8,-8]});p.point([-2,2],{label:'B',labelOffset:[8,-8]});
  }};
/* Week 4 path: cubic Hermite pieces through hand-placed joints, tangents chosen to match the homework drawing */
const PATH=(()=>{
  const J=[[0.83,3.25],[-0.03,4.5],[0.5,5.63],[1.25,5.83],[3.08,3.92],[5.08,1.33],[7.62,0.37]];
  const T=[[-0.81,0.58],[0,1],[0.64,0.77],[1,0],[0.5,-0.87],[0.81,-0.59],[1,-0.08]].map(unit);
  const seg=i=>{const d=norm(vsub(J[i+1],J[i]))/3;return [J[i],vadd(J[i],vscale(d,T[i])),vsub(J[i+1],vscale(d,T[i+1])),J[i+1]];};
  const r=s=>{const i=Math.min(5,Math.floor(s)),u=s-i,[a,b,c,e]=seg(i),m=1-u;return [0,1].map(k=>m*m*m*a[k]+3*m*m*u*b[k]+3*m*u*u*c[k]+u*u*u*e[k]);};
  return {r,J,T};
})();
/* candidate accelerations at a point: combinations of the unit tangent T and the inward normal N, listed in label order */
function candidates(Tv,N,order){const combos={fi:vadd(Tv,N),bi:vsub(N,Tv),bo:vscale(-1,vadd(Tv,N)),fo:vsub(Tv,N)};return order.map(k=>vscale(0.95,unit(combos[k])));}
const P1={at:PATH.J[2],T:PATH.T[2]},P2={at:PATH.J[5],T:PATH.T[5]};
P1.N=[P1.T[1],-P1.T[0]];            /* clockwise bend over the top: inside is to the right of the motion */
P2.N=[-P2.T[1],P2.T[0]];            /* counterclockwise bend near B: inside is to the left */
P1.c=candidates(P1.T,P1.N,['fi','bo','bi','fo']);   /* arrow 3 is backward and inside */
P2.c=candidates(P2.T,P2.N,['bi','fi','fo','bo']);   /* arrow 1 is backward and inside */
const pathFig={style:'aspect-ratio:9/7',opts:{xmin:-0.8,xmax:8.2,ymin:-0.5,ymax:6.5,grid:false,axes:false,labels:false},
  draw(p,solved){
    p.param(PATH.r,0,6,{color:C.b,width:2.4,n:400});
    p.point(PATH.J[0],{label:'A',labelOffset:[6,18]});p.point(PATH.J[6],{label:'B',labelOffset:[8,4]});
    [[P1,'P₁',[-26,-6],2],[P2,'P₂',[-4,22],0]].forEach(([P,name,off,right])=>{
      P.c.forEach((v,i)=>p.vector(P.at,vadd(P.at,v),{color:solved&&i===right?C.c:C.d,width:solved&&i===right?3:1.8,label:String(i+1),labelOffset:[4,-2]}));
      if(solved)p.vector(P.at,vadd(P.at,vscale(1.1,P.T)),{color:C.b,label:'v',dash:[5,4]});
      p.point(P.at,{r:4,label:name,labelOffset:off});
    });
  }};
const squareFig={opts:{xmin:0,xmax:5.6,ymin:0.2,ymax:5.8,grid:false,axes:false,labels:false},
  draw(p){
    const TL=[0.5,4.4],w=[3.5,0.9],a=[0.9,-3.5],TR=vadd(TL,w),BL=vadd(TL,a),BR=vadd(BL,w);
    const bold='600 15px -apple-system,Segoe UI,sans-serif';
    p.vector(TL,TR,{color:C.d});p.vector(BL,BR,{color:C.d});p.vector(TL,BL,{color:C.a});p.vector(TR,BR,{color:C.a});
    p.vector(TL,BR,{color:C.b,width:2.2});p.vector(TR,BL,{color:C.c,width:2.2});
    p.text([2.25,4.85],'w',{color:C.d,font:bold,dy:-8});p.text([3.15,1.35],'w',{color:C.d,font:bold,dy:18});
    p.text([0.95,2.65],'a',{color:C.a,font:bold,dx:-18});p.text([4.45,3.55],'a',{color:C.a,font:bold,dx:10});
    p.text([3.58,2.58],'v',{color:C.b,font:bold,dx:8});p.text([2.18,2.22],'u',{color:C.c,font:bold,dx:-16});
  }};

window.GAUNTLET_M1=[
/* ======================================================================== vectors */
{id:'v-add',topic:'vec',title:'Adding, scaling, subtracting vectors',
 concept:{q:R`How do you draw \(\mathbf{a}+\mathbf{b}\), a multiple \(c\,\mathbf{b}\) with \(c\) negative, and \(\mathbf{b}-\mathbf{a}\)? Describe each one geometrically, without coordinates.`,
  rubric:['Sum: place the tail of b at the tip of a (tip to tail); a + b runs from the tail of a to the tip of b. Equivalently, the diagonal of the parallelogram on a and b.','Scalar multiple: c b lies along the same line as b with |c| times the length; a negative c reverses the direction.','Difference: with a and b drawn from the same point, b - a is the arrow from the tip of a to the tip of b, because a + (b - a) = b.'],
  model:R`<p><b>Sum:</b> slide \(\mathbf{b}\) so its tail sits on the tip of \(\mathbf{a}\). Then \(\mathbf{a}+\mathbf{b}\) runs from the tail of \(\mathbf{a}\) to the tip of \(\mathbf{b}\). It is also the diagonal of the parallelogram built on \(\mathbf{a}\) and \(\mathbf{b}\).</p><p><b>Scalar multiple:</b> \(c\,\mathbf{b}\) lies on the line of \(\mathbf{b}\) and is \(|c|\) times as long. A negative \(c\) flips it, so \(-\tfrac12\mathbf{b}\) is half as long and points the other way.</p><p><b>Difference:</b> draw both from one point. \(\mathbf{b}-\mathbf{a}\) is the arrow from the tip of \(\mathbf{a}\) to the tip of \(\mathbf{b}\), because \(\mathbf{a}+(\mathbf{b}-\mathbf{a})=\mathbf{b}\).</p>`},
 app:{source:'Week 1 HW · Problem 2',
  prompt:R`The homework picture, now on a grid: \(\mathbf{a}=\langle 1,-4\rangle\) and \(\mathbf{b}=\langle 3,2\rangle\). Give each vector in components. The answers are drawn in green once you finish.`,
  fig:{opts:{xmin:-3,xmax:11,ymin:-6,ymax:8},draw(p,solved){
    p.vector([0,0],[1,-4],{color:C.a,label:'a'});p.vector([0,0],[3,2],{color:C.b,label:'b'});
    if(solved){[[4,-2,'a+b'],[10,2,'a+3b'],[-1.5,-1,'-b/2'],[2,6,'b-a']].forEach(([x,y,l])=>p.vector([0,0],[x,y],{color:C.c,label:l,width:2}));p.vector([1,-4],[3,2],{color:C.c,dash:[5,4],width:1.6});}}},
  parts:[{k:'s',label:R`\(\mathbf{a}+\mathbf{b}=\)`,kind:'vector',ans:[4,-2],sol:'<4,-2>'},
   {k:'t',label:R`\(\mathbf{a}+3\mathbf{b}=\)`,kind:'vector',ans:[10,2],sol:'<10,2>'},
   {k:'h',label:R`\(-\tfrac12\mathbf{b}=\)`,kind:'vector',ans:[-1.5,-1],sol:'<-3/2,-1>'},
   {k:'d',label:R`\(\mathbf{b}-\mathbf{a}=\)`,kind:'vector',ans:[2,6],sol:'<2,6>'}],
  solution:R`Componentwise: \(\mathbf{a}+\mathbf{b}=\langle 4,-2\rangle\), \(\mathbf{a}+3\mathbf{b}=\langle 1+9,\,-4+6\rangle=\langle 10,2\rangle\), \(-\tfrac12\mathbf{b}=\langle -\tfrac32,-1\rangle\) (half as long, opposite to \(\mathbf{b}\)), \(\mathbf{b}-\mathbf{a}=\langle 2,6\rangle\). In the picture every answer is drawn from the origin; the dashed copy of \(\mathbf{b}-\mathbf{a}\) shows it running from the tip of \(\mathbf{a}\) to the tip of \(\mathbf{b}\).`}},

{id:'v-dot-angle',topic:'vec',title:'What the dot product measures',
 concept:{q:R`How should you interpret the scalar \(\mathbf{a}\cdot\mathbf{b}\)? What does its sign tell you, and how do you get the angle between \(\mathbf{a}\) and \(\mathbf{b}\) from it?`,
  rubric:['a·b = |a||b|cos(theta): it measures how much a and b point the same way (equivalently, |b| times the signed length of the shadow of a on b).','Sign: positive means the angle is acute, zero means perpendicular, negative means obtuse.','Angle: cos(theta) = a·b / (|a||b|), then theta = arccos of that, between 0 and pi.'],
  model:R`<p>\(\mathbf{a}\cdot\mathbf{b}=|\mathbf{a}||\mathbf{b}|\cos\theta\). It measures how much the two vectors point the same way: the length of \(\mathbf{b}\) times the signed length of the shadow \(\mathbf{a}\) casts on \(\mathbf{b}\).</p><p>Positive: acute angle. Zero: perpendicular. Negative: obtuse.</p><p>Angle: \(\cos\theta=\dfrac{\mathbf{a}\cdot\mathbf{b}}{|\mathbf{a}||\mathbf{b}|}\), so \(\theta=\arccos(\cdot)\in[0,\pi]\). Scaling a vector by a positive number scales the dot product and the length by the same factor, so the angle does not change.</p>`},
 app:{source:'Week 1 HW · Problem 3',
  prompt:R`Let \(A\) be a vertex of a cube. Consider the interior diagonal from \(A\) to the opposite vertex and a face diagonal from \(A\) across one of the square faces. What angle do they make? Does it depend on the side length?`,
  parts:[{k:'c',label:R`\(\cos\theta=\)`,kind:'number',ans:Math.sqrt(2/3),sol:'sqrt(6)/3',placeholder:'exact'},
   {k:'deg',label:R`\(\theta\approx\)`,after:'degrees, one decimal',kind:'number',ans:35.264,tol:0.05,sol:'35.3'},
   {k:'dep',label:'Does the angle depend on the side length?',kind:'choice',options:['Yes: a bigger cube gives a bigger angle','No: the side length cancels'],ans:1}],
  solution:R`Put \(A\) at the origin with side \(s\). Interior diagonal \(\mathbf{d}=\langle s,s,s\rangle\), face diagonal \(\mathbf{f}=\langle s,s,0\rangle\). \(\mathbf{d}\cdot\mathbf{f}=2s^2\), \(|\mathbf{d}|=s\sqrt3\), \(|\mathbf{f}|=s\sqrt2\), so \(\cos\theta=\dfrac{2s^2}{s^2\sqrt6}=\dfrac{2}{\sqrt6}=\dfrac{\sqrt6}{3}\) and \(\theta\approx 35.3^\circ\). Every \(s\) cancels, so every cube gives the same angle.`}},

{id:'v-perp-set',topic:'vec',title:'The set of vectors perpendicular to n',
 concept:{q:R`What does the equation \(\mathbf{v}\cdot\mathbf{n}=0\) describe, as a set of vectors \(\mathbf{v}\)? Why is that set a line in \(\mathbb{R}^2\) but a plane in \(\mathbb{R}^3\)?`,
  rubric:['It is the set of all vectors perpendicular to n (including the zero vector).','In R^2 the directions perpendicular to n form a line through the origin; in R^3 they form a whole plane through the origin with normal vector n.','Written out it is one linear equation (n1 x + n2 y = 0, or n1 x + n2 y + n3 z = 0), and one equation removes one dimension.'],
  model:R`<p>It is every vector perpendicular to \(\mathbf{n}\). In components it is a single linear equation, \(n_1x+n_2y=0\) or \(n_1x+n_2y+n_3z=0\), and one equation cuts one dimension off the space.</p><p>In \(\mathbb{R}^2\) there is only one perpendicular direction (up to scaling), so you get a line through the origin. In \(\mathbb{R}^3\) there are two independent perpendicular directions, so you get the plane through the origin with normal \(\mathbf{n}\).</p>`},
 app:{source:'Week 1 HW · Problem 4',
  prompt:R`(a) Describe the set of all \(\mathbf{v}=\langle x,y\rangle\) in \(\mathbb{R}^2\) with \(\mathbf{v}\cdot\langle 1,2\rangle=0\). (b) Describe the set of all \(\mathbf{v}=\langle x,y,z\rangle\) in \(\mathbb{R}^3\) with \(\mathbf{v}\cdot\langle 1,2,0\rangle=0\).`,
  parts:[{k:'e2',label:'(a) equation in x and y:',kind:'equation',vars:['x','y'],ans:e=>e.x+2*e.y,sol:'x+2y=0'},
   {k:'s2',label:'(a) the set is',kind:'choice',options:['a line through the origin','a line not through the origin','a plane through the origin','a single point'],ans:0},
   {k:'e3',label:'(b) equation in x, y, z:',kind:'equation',vars:['x','y','z'],ans:e=>e.x+2*e.y,sol:'x+2y=0'},
   {k:'s3',label:'(b) the set is',kind:'choice',options:['a line through the origin','a plane through the origin that contains the z-axis','a plane through the origin perpendicular to the z-axis','a single point'],ans:1}],
  solution:R`(a) \(\langle x,y\rangle\cdot\langle 1,2\rangle=x+2y=0\): the line \(y=-\tfrac12x\) through the origin, perpendicular to \(\langle 1,2\rangle\). (b) \(x+2y+0z=0\). Now \(z\) is free, so the set is the plane through the origin with normal \(\langle 1,2,0\rangle\). The normal has no \(z\)-component, so the plane stands vertically and contains the whole \(z\)-axis: it is the line from (a) swept straight up and down.`}},

{id:'v-dot-scalar',topic:'vec',title:'The dot product is a scalar',
 concept:{q:R`What kind of object is \(\mathbf{a}\cdot\mathbf{b}\)? Use that to explain why \(\mathbf{a}\cdot\mathbf{b}=\mathbf{a}\cdot\mathbf{c}\) does not let you cancel \(\mathbf{a}\).`,
  rubric:['a·b is a scalar (a number), not a vector.','a·b = a·c rearranges to a·(b - c) = 0, which only says b - c is perpendicular to a.','So b and c can differ by any vector perpendicular to a; nothing forces b = c.'],
  model:R`<p>\(\mathbf{a}\cdot\mathbf{b}\) is a number. Knowing one number about \(\mathbf{b}\) (its component along \(\mathbf{a}\)) cannot pin down all of \(\mathbf{b}\).</p><p>\(\mathbf{a}\cdot\mathbf{b}=\mathbf{a}\cdot\mathbf{c}\) is the same as \(\mathbf{a}\cdot(\mathbf{b}-\mathbf{c})=0\): the difference \(\mathbf{b}-\mathbf{c}\) only has to be perpendicular to \(\mathbf{a}\). So \(\mathbf{b}\) and \(\mathbf{c}\) can differ by anything perpendicular to \(\mathbf{a}\).</p>`},
 app:{source:'Week 1 HW · Problem 5',
  prompt:R`Let \(\mathbf{a},\mathbf{b},\mathbf{c}\) be vectors in \(\mathbb{R}^3\). (a) True or false: if \(\mathbf{a}\cdot\mathbf{b}=\mathbf{a}\cdot\mathbf{c}\) and \(\mathbf{a}\ne\mathbf{0}\), then \(\mathbf{b}=\mathbf{c}\). (b) True or false: \((\mathbf{a}\cdot\mathbf{b})\cdot\mathbf{c}=\mathbf{a}\cdot(\mathbf{b}\cdot\mathbf{c})\).`,
  parts:[{k:'ta',label:'(a)',kind:'choice',options:['True','False'],ans:1},
   {k:'cx',label:R`(a) A counterexample: with \(\mathbf{a}=\langle 1,0,0\rangle\) and \(\mathbf{b}=\langle 0,1,0\rangle\), give some \(\mathbf{c}\ne\mathbf{b}\) with \(\mathbf{a}\cdot\mathbf{c}=\mathbf{a}\cdot\mathbf{b}\):`,kind:'custom',check:dotCounter,sol:'<0,0,1>'},
   {k:'tb',label:'(b)',kind:'choice',options:['True: dot products regroup like ordinary multiplication','False: the left side is a multiple of c and the right side is a multiple of a','True: both sides are the same number'],ans:1}],
  solution:R`(a) False. The hypothesis says \(\mathbf{a}\cdot(\mathbf{b}-\mathbf{c})=0\), so \(\mathbf{b}-\mathbf{c}\) only has to be perpendicular to \(\mathbf{a}\). With \(\mathbf{a}=\mathbf{i}\), \(\mathbf{b}=\mathbf{j}\), \(\mathbf{c}=\mathbf{k}\), both dot products are 0 but \(\mathbf{b}\ne\mathbf{c}\). Any \(\mathbf{c}=\langle 0,p,q\rangle\) other than \(\mathbf{b}\) works. (b) False. \(\mathbf{a}\cdot\mathbf{b}\) is a number, so the outer "\(\cdot\)" can only mean scaling. Then the left side \((\mathbf{a}\cdot\mathbf{b})\mathbf{c}\) is parallel to \(\mathbf{c}\) and the right side \((\mathbf{b}\cdot\mathbf{c})\mathbf{a}\) is parallel to \(\mathbf{a}\). With \(\mathbf{a}=\mathbf{b}=\mathbf{i}\) and \(\mathbf{c}=\mathbf{i}+\mathbf{j}\): the left side is \(\mathbf{i}+\mathbf{j}\), the right side is \(\mathbf{i}\).`}},

{id:'v-proj',topic:'vec',title:'Projections in a square',
 concept:{q:R`What is \(\operatorname{proj}_{\mathbf{b}}\mathbf{a}\) geometrically? What is it when \(\mathbf{a}\perp\mathbf{b}\), and when \(\mathbf{a}\) is parallel to \(\mathbf{b}\)?`,
  rubric:['It is the shadow of a on the line of b: the vector along b you reach by dropping a perpendicular from the tip of a onto that line. Formula (a·b / |b|^2) b.','If a is perpendicular to b, the projection is the zero vector; if a is parallel to b, the projection is a itself.'],
  model:R`<p>\(\operatorname{proj}_{\mathbf{b}}\mathbf{a}=\dfrac{\mathbf{a}\cdot\mathbf{b}}{|\mathbf{b}|^2}\,\mathbf{b}\) is the shadow of \(\mathbf{a}\) on the line through \(\mathbf{b}\): drop a perpendicular from the tip of \(\mathbf{a}\) to that line.</p><p>Perpendicular: no shadow, \(\mathbf{0}\). Parallel: the shadow is \(\mathbf{a}\) itself. Only the line of \(\mathbf{b}\) matters, not its length or which way it points.</p>`},
 app:{source:'Week 2 HW · Problem 1',
  prompt:R`The vectors \(\mathbf{a}\) and \(\mathbf{w}\) form a square; \(\mathbf{v}\) and \(\mathbf{u}\) are its diagonals. In terms of \(\mathbf{a},\mathbf{u},\mathbf{v},\mathbf{w}\), give the simplest expression for each projection. Type vectors as letters, like <code>2a - w</code>, <code>u/2</code>, or <code>0</code>.`,
  fig:squareFig,
  parts:[{k:'a',label:R`(a) \(\operatorname{proj}_{\mathbf{a}}\mathbf{w}=\)`,kind:'custom',check:linComb(0,0),sol:'0'},
   {k:'b',label:R`(b) \(\operatorname{proj}_{\mathbf{w}}\mathbf{w}=\)`,kind:'custom',check:linComb(0,1),sol:'w'},
   {k:'c',label:R`(c) \(\operatorname{proj}_{\mathbf{a}}\mathbf{u}=\)`,kind:'custom',check:linComb(1,0),sol:'a'},
   {k:'d',label:R`(d) \(\operatorname{proj}_{\mathbf{v}}\mathbf{u}=\)`,kind:'custom',check:linComb(0,0),sol:'0'},
   {k:'e',label:R`(e) \(\operatorname{proj}_{\mathbf{w}}\mathbf{u}=\)`,kind:'custom',check:linComb(0,-1),sol:'-w'},
   {k:'f',label:R`(f) \(\operatorname{proj}_{\mathbf{u}}\mathbf{a}=\)`,kind:'custom',check:linComb(0.5,-0.5),sol:'u/2'}],
  solution:R`From the picture \(\mathbf{v}=\mathbf{a}+\mathbf{w}\) and \(\mathbf{u}=\mathbf{a}-\mathbf{w}\), with \(\mathbf{a}\perp\mathbf{w}\) and \(|\mathbf{a}|=|\mathbf{w}|\). (a) \(\mathbf{w}\perp\mathbf{a}\): \(\mathbf{0}\). (b) A vector projects onto itself: \(\mathbf{w}\). (c) The \(-\mathbf{w}\) part of \(\mathbf{u}\) is perpendicular to \(\mathbf{a}\), so the shadow is \(\mathbf{a}\). (d) The diagonals of a square are perpendicular (\(\mathbf{u}\cdot\mathbf{v}=|\mathbf{a}|^2-|\mathbf{w}|^2=0\)): \(\mathbf{0}\). (e) The \(\mathbf{a}\) part of \(\mathbf{u}\) is perpendicular to \(\mathbf{w}\), leaving \(-\mathbf{w}\). (f) \(\dfrac{\mathbf{a}\cdot\mathbf{u}}{|\mathbf{u}|^2}\mathbf{u}=\dfrac{|\mathbf{a}|^2}{2|\mathbf{a}|^2}\mathbf{u}=\tfrac12\mathbf{u}\): a side of the square casts half the diagonal.`}},

{id:'v-cross-geo',topic:'vec',title:'Cross product without a determinant',
 concept:{q:R`What do the length and the direction of \(\mathbf{a}\times\mathbf{b}\) mean geometrically? How do you pick its direction without computing a determinant?`,
  rubric:['Length: |a x b| = |a||b|sin(theta), the area of the parallelogram spanned by a and b.','Direction: perpendicular to both a and b.','Of the two perpendicular directions, the right-hand rule picks one: curl your fingers from a toward b and your thumb points along a x b (so b x a = -(a x b)).'],
  model:R`<p><b>Length:</b> \(|\mathbf{a}\times\mathbf{b}|=|\mathbf{a}||\mathbf{b}|\sin\theta\), the area of the parallelogram on \(\mathbf{a}\) and \(\mathbf{b}\). Parallel vectors give \(\mathbf{0}\).</p><p><b>Direction:</b> perpendicular to both. There are two such directions; the right-hand rule chooses: fingers along \(\mathbf{a}\), curl them toward \(\mathbf{b}\), and the thumb points along \(\mathbf{a}\times\mathbf{b}\). Swapping the order flips it: \(\mathbf{b}\times\mathbf{a}=-\mathbf{a}\times\mathbf{b}\).</p>`},
 app:{source:'Week 2 HW · Problem 2',
  prompt:R`Find \((\mathbf{i}+\mathbf{j})\times(\mathbf{i}-\mathbf{j})\) using the geometric description of the cross product, no determinants. Then compare your reasoning with the solution.`,
  parts:[{k:'x',label:R`\((\mathbf{i}+\mathbf{j})\times(\mathbf{i}-\mathbf{j})=\)`,kind:'vector',ans:[0,0,-2],sol:'<0,0,-2>'}],
  solution:R`Both vectors lie in the \(xy\)-plane, so the product points along \(\pm\mathbf{k}\). Length: \(|\mathbf{i}+\mathbf{j}|=|\mathbf{i}-\mathbf{j}|=\sqrt2\), and they are perpendicular (dot product \(1-1=0\)), so the parallelogram is a square of area \(2\). Direction: \(\mathbf{i}+\mathbf{j}\) points northeast and \(\mathbf{i}-\mathbf{j}\) southeast. Turning from the first to the second is clockwise seen from above, so the right-hand rule points your thumb down. Answer: \(-2\mathbf{k}\).`}},

{id:'v-dot-cross',topic:'vec',title:'From the dot product to the cross product',
 concept:{q:R`Suppose you know \(|\mathbf{a}|\), \(|\mathbf{b}|\), and \(\mathbf{a}\cdot\mathbf{b}\). How do you get \(|\mathbf{a}\times\mathbf{b}|\)? What connects the two products?`,
  rubric:['The dot product gives the angle: cos(theta) = a·b / (|a||b|).','The cross product length uses the same angle: |a x b| = |a||b|sin(theta), where sin(theta) is not negative because theta is between 0 and pi.'],
  model:R`<p>Both products use the same angle \(\theta\): \(\mathbf{a}\cdot\mathbf{b}=|\mathbf{a}||\mathbf{b}|\cos\theta\) and \(|\mathbf{a}\times\mathbf{b}|=|\mathbf{a}||\mathbf{b}|\sin\theta\). Get \(\cos\theta\) from the dot product, then \(\sin\theta=\sqrt{1-\cos^2\theta}\) (never negative, since \(0\le\theta\le\pi\)).</p><p>Equivalently \(|\mathbf{a}\times\mathbf{b}|^2+(\mathbf{a}\cdot\mathbf{b})^2=|\mathbf{a}|^2|\mathbf{b}|^2\).</p>`},
 app:{source:'Week 2 HW · Problem 3',
  prompt:R`The page is a plane inside \(\mathbb{R}^3\), and \(\mathbf{a}\), \(\mathbf{b}\) are drawn in it with \(|\mathbf{a}|=5\), \(|\mathbf{b}|=4\), and \(\mathbf{a}\cdot\mathbf{b}=-10\sqrt2\). Describe \(\mathbf{a}\times\mathbf{b}\): its length and its direction.`,
  fig:{style:'max-width:300px',opts:{xmin:-0.9,xmax:3.4,ymin:-1.9,ymax:2.4,grid:false,axes:false,labels:false},draw(p,solved){
    const O=[0.3,0.9];p.vector(O,vadd(O,[0.4,-2.4]),{color:C.e,label:'a',labelOffset:[-18,-10]});p.vector(O,vadd(O,[1.9,1.1]),{color:C.b,label:'b',labelOffset:[6,14]});
    if(solved)p.point(O,{color:C.c,r:7,ring:true,label:'a×b, out of the page',labelOffset:[-14,-14]});}},
  parts:[{k:'len',label:R`\(|\mathbf{a}\times\mathbf{b}|=\)`,kind:'number',ans:10*Math.SQRT2,sol:'10sqrt(2)'},
   {k:'dir',label:'Direction:',kind:'choice',options:['out of the page, toward you','into the page, away from you','in the plane of the page','it is the zero vector'],ans:0}],
  solution:R`\(\cos\theta=\dfrac{-10\sqrt2}{5\cdot4}=-\dfrac{\sqrt2}{2}\), so \(\theta=135^\circ\) and \(\sin\theta=\dfrac{\sqrt2}{2}\). Then \(|\mathbf{a}\times\mathbf{b}|=5\cdot4\cdot\dfrac{\sqrt2}{2}=10\sqrt2\). The product is perpendicular to the page. Turning from \(\mathbf{a}\) (pointing down) to \(\mathbf{b}\) (up and to the right) through the angle between them is counterclockwise, so the right-hand rule points your thumb out of the page, toward you. (The drawing is not to scale; the angle comes from the dot product.)`}},

{id:'v-area',topic:'vec',title:'Area of a parallelogram from its corners',
 concept:{q:R`Given one corner \(P\) of a parallelogram and the two corners \(Q\), \(R\) next to it, how do you find its area? Why does a cross product give area?`,
  rubric:['Use the edge vectors PQ = Q - P and PR = R - P, not the position vectors of the points.','Area = |PQ x PR|, because |u x v| = |u||v|sin(theta) is base times height of the parallelogram. (Triangle PQR would be half.)'],
  model:R`<p>Build the edges first: \(\overrightarrow{PQ}=Q-P\) and \(\overrightarrow{PR}=R-P\). The points themselves are not the edges.</p><p>Area \(=|\overrightarrow{PQ}\times\overrightarrow{PR}|\). Reason: with base \(|\overrightarrow{PQ}|\), the height is \(|\overrightarrow{PR}|\sin\theta\), and base times height is exactly \(|\mathbf{u}||\mathbf{v}|\sin\theta=|\mathbf{u}\times\mathbf{v}|\). The triangle \(PQR\) is half of it.</p>`},
 app:{source:'Week 2 HW · Problem 4(a)(b)',
  prompt:R`A solar panel on a slanted roof has one corner at \(P=(0,0,8)\) and the two adjacent corners at \(Q=(12,0,8)\) and \(R=(6,8,14)\). The \(xy\)-plane is the ground. Find the edge vectors at \(P\) and the area of the panel.`,
  parts:[{k:'pq',label:R`\(\overrightarrow{PQ}=\)`,kind:'vector',ans:[12,0,0],sol:'<12,0,0>'},{k:'pr',label:R`\(\overrightarrow{PR}=\)`,kind:'vector',ans:[6,8,6],sol:'<6,8,6>'},{k:'A',label:'area =',kind:'number',ans:120,sol:'120'}],
  solution:R`Edges: \(\overrightarrow{PQ}=\langle 12,0,0\rangle\), \(\overrightarrow{PR}=\langle 6,8,6\rangle\). Their dot product is 72, so the panel is a parallelogram, not a rectangle. \(\overrightarrow{PQ}\times\overrightarrow{PR}=\langle 0\cdot6-0\cdot8,\;0\cdot6-12\cdot6,\;12\cdot8-0\cdot6\rangle=\langle 0,-72,96\rangle=24\langle 0,-3,4\rangle\), with length \(24\cdot5=120\).`}},

{id:'v-plane-angle',topic:'vec',title:'Angle between two planes',
 concept:{q:R`How do you find the angle between two planes?`,
  rubric:['It is the angle between their normal vectors.','Get each normal from the coefficients of the plane equation, or by crossing two direction vectors that lie in the plane.','cos(theta) = |n1·n2| / (|n1||n2|); the absolute value gives the acute angle.'],
  model:R`<p>The angle between planes is the angle between their normals. Read a normal off the equation (\(ax+by+cz=d\) has normal \(\langle a,b,c\rangle\)) or cross two in-plane directions. Then \(\cos\theta=\dfrac{|\mathbf{n}_1\cdot\mathbf{n}_2|}{|\mathbf{n}_1||\mathbf{n}_2|}\); the absolute value picks the acute angle, since \(\mathbf{n}\) and \(-\mathbf{n}\) are both normals.</p>`},
 app:{source:'Week 2 HW · Problem 4(c)',
  prompt:R`Same panel: \(P=(0,0,8)\), \(Q=(12,0,8)\), \(R=(6,8,14)\), with the \(xy\)-plane as the ground. What angle does the panel make with the ground?`,
  parts:[{k:'c',label:R`\(\cos\theta=\)`,kind:'number',ans:0.8,sol:'4/5'},{k:'deg',label:R`\(\theta\approx\)`,after:'degrees, one decimal',kind:'number',ans:36.87,tol:0.05,sol:'36.9'}],
  solution:R`Panel normal: \(\overrightarrow{PQ}\times\overrightarrow{PR}=\langle 0,-72,96\rangle\), or the parallel \(\mathbf{n}_1=\langle 0,-3,4\rangle\). Ground normal: \(\mathbf{n}_2=\mathbf{k}\). \(\cos\theta=\dfrac{|\mathbf{n}_1\cdot\mathbf{k}|}{|\mathbf{n}_1|}=\dfrac45\), so \(\theta=\arccos\tfrac45\approx 36.9^\circ\). Sanity check: \(\overrightarrow{PQ}\) is level, and straight up the panel (perpendicular to it) the panel rises 6 over 8 horizontally, \(\tan\theta=\tfrac34\), the same angle.`}},

/* ======================================================================== lines, planes, surfaces */
{id:'l-plane',topic:'lps',title:'A plane from points and a perpendicular plane',
 concept:{q:R`How do you find the equation of a plane when you are given things that lie in it (points, directions) instead of its normal? What does "perpendicular to another plane" give you?`,
  rubric:['A plane needs a point and a normal n; the equation is n · (r - r0) = 0.','Find two non-parallel direction vectors lying in the plane (for example, differences of points) and cross them to get n.','If the plane is perpendicular to another plane, the other plane\'s normal lies parallel to our plane, so it can be one of the two in-plane directions.'],
  model:R`<p>You always need one point and a normal \(\mathbf{n}\); then \(\mathbf{n}\cdot(\mathbf{r}-\mathbf{r}_0)=0\). When the normal is not given, find two non-parallel vectors that lie in the plane and cross them.</p><p>Two points give one in-plane vector (their difference). "Perpendicular to the plane \(\Pi\)" gives the other: \(\Pi\)'s normal is parallel to our plane. A common mistake is to use \(\Pi\)'s normal as our normal, which gives a plane parallel to \(\Pi\) instead.</p>`},
 app:{source:'Week 3 HW · Problem 1',
  prompt:R`Find an equation for the plane that contains the points \((0,-2,5)\) and \((-1,3,1)\) and is perpendicular to the plane \(5x+4y-2z=0\).`,
  parts:[{k:'E',label:'equation:',kind:'equation',ans:e=>6*e.x-22*e.y-29*e.z+101,sol:'6x-22y-29z=-101',xwide:true,placeholder:'ax + by + cz = d'}],
  solution:R`Two directions in the plane: \(\overrightarrow{PQ}=\langle -1,5,-4\rangle\) and, because the planes are perpendicular, the given normal \(\mathbf{n}_0=\langle 5,4,-2\rangle\). Cross them: \(\mathbf{n}=\overrightarrow{PQ}\times\mathbf{n}_0=\langle 6,-22,-29\rangle\). Through \((0,-2,5)\): \(d=0+44-145=-101\), so \(6x-22y-29z=-101\). Check the second point: \(-6-66-29=-101\). Check perpendicularity: \(\mathbf{n}\cdot\mathbf{n}_0=30-88+58=0\).`}},

{id:'l-parallel-dist',topic:'lps',title:'Distance between parallel planes',
 concept:{q:R`How can you tell that two planes are parallel, and how do you find the distance between them?`,
  rubric:['Parallel planes have parallel normal vectors (one is a scalar multiple of the other).','Distance: take a point on one plane and use the point-to-plane distance |a x0 + b y0 + c z0 - d| / |n| (the length of the projection of a connecting vector onto the normal); or rescale so both equations share the same (a, b, c) and use |d1 - d2| / |n|.'],
  model:R`<p>Parallel planes have parallel normals. The distance between them is the distance from any point of one to the other, measured along the normal: \(D=\dfrac{|ax_0+by_0+cz_0-d|}{\sqrt{a^2+b^2+c^2}}\). That formula is the length of the projection of a connecting vector onto \(\mathbf{n}\).</p><p>Shortcut: scale one equation so both have the same \((a,b,c)\); then \(D=\dfrac{|d_1-d_2|}{|\mathbf{n}|}\). Comparing the constants before rescaling is the classic mistake.</p>`},
 app:{source:'Week 3 HW · Problem 2',
  prompt:R`Find the distance from the plane \(2x-3y+z=4\) to the plane \(4x-6y+2z=1\). Exact, or a decimal to three places.`,
  parts:[{k:'d',label:'distance =',kind:'number',ans:Math.sqrt(14)/4,tol:0.0006,sol:'sqrt(14)/4'}],
  solution:R`The normals \(\langle 2,-3,1\rangle\) and \(\langle 4,-6,2\rangle\) are parallel. Divide the second equation by 2: \(2x-3y+z=\tfrac12\). Now \(D=\dfrac{|4-\tfrac12|}{\sqrt{14}}=\dfrac{7}{2\sqrt{14}}=\dfrac{\sqrt{14}}{4}\approx 0.935\). With a point instead: \((2,0,0)\) is on the first plane, and its distance to \(4x-6y+2z=1\) is \(\dfrac{|8-1|}{\sqrt{56}}=\dfrac{7}{2\sqrt{14}}\).`}},

{id:'l-skew',topic:'lps',title:'Distance between skew lines',
 concept:{q:R`How do you find the distance between two skew lines? Why does \(\mathbf{d}_1\times\mathbf{d}_2\) show up?`,
  rubric:['n = d1 x d2 is perpendicular to both lines, so it is the direction of the shortest segment between them.','Take any vector from a point on line 1 to a point on line 2.','The distance is the length of that vector\'s projection onto n: |P1P2 · n| / |n|.'],
  model:R`<p>The shortest segment between the lines is perpendicular to both, so it points along \(\mathbf{n}=\mathbf{d}_1\times\mathbf{d}_2\). Take any connecting vector \(\overrightarrow{P_1P_2}\) between points of the two lines; only its component along \(\mathbf{n}\) measures the gap, so \(D=\dfrac{|\overrightarrow{P_1P_2}\cdot\mathbf{n}|}{|\mathbf{n}|}\).</p><p>If \(\mathbf{d}_1\times\mathbf{d}_2=\mathbf{0}\) the lines are parallel, and you use a point-to-line distance instead.</p>`},
 app:{source:'Week 3 HW · Problem 3',
  prompt:R`Find the distance from the line \(x=1+t,\ y=1+6t,\ z=2t\) to the line \(x=1+2s,\ y=5+15s,\ z=-2+6s\).`,
  parts:[{k:'n',label:'a vector perpendicular to both lines:',kind:'vector',ans:[6,-2,3],parallel:true,sol:'<6,-2,3>'},{k:'d',label:'distance =',kind:'number',ans:2,sol:'2'}],
  solution:R`\(\mathbf{d}_1=\langle 1,6,2\rangle\), \(\mathbf{d}_2=\langle 2,15,6\rangle\). \(\mathbf{n}=\mathbf{d}_1\times\mathbf{d}_2=\langle 36-30,\;4-6,\;15-12\rangle=\langle 6,-2,3\rangle\), \(|\mathbf{n}|=7\). Points \(P_1=(1,1,0)\) and \(P_2=(1,5,-2)\) give \(\overrightarrow{P_1P_2}=\langle 0,4,-2\rangle\). \(D=\dfrac{|0-8-6|}{7}=2\).`}},

{id:'l-intersect-curve',topic:'lps',title:'Parametrizing an intersection curve',
 concept:{q:R`How do you parametrize the curve where two surfaces intersect? Which surface do you parametrize first?`,
  rubric:['Start with the surface that is easiest to parametrize: a circle or ellipse in two variables (x^2 + z^2 = 9 gives x = 3cos t, z = 3sin t), or one variable used as the parameter.','Substitute that into the other surface\'s equation and solve for the remaining variable in terms of t.','The result satisfies both equations, so it lies on both surfaces.'],
  model:R`<p>Parametrize the simpler surface first, usually the one missing a variable: a cylinder \(x^2+z^2=9\) becomes \(x=3\cos t\), \(z=3\sin t\). Then substitute into the other equation and solve for the variable that is left. What you get satisfies both equations, so it traces the intersection. Check by plugging back in.</p>`},
 app:{source:'Week 3 HW · Problem 4',
  prompt:R`Give a parametrization \(\mathbf{r}(t)\) of the curve where the plane \(x+2y+3z=7\) meets the cylinder \(x^2+z^2=9\).`,
  parts:[{k:'r',label:R`\(\mathbf{r}(t)=\)`,kind:'custom',check:onBoth((x,y,z)=>x+2*y+3*z-7,(x,y,z)=>x*x+z*z-9),sol:'<3cos(t), (7-3cos(t)-9sin(t))/2, 3sin(t)>',xwide:true,placeholder:'<x(t), y(t), z(t)>'}],
  solution:R`The cylinder is the simple one: \(x=3\cos t\), \(z=3\sin t\), \(0\le t\le 2\pi\). The plane then gives \(2y=7-x-3z\), so \(y=\dfrac{7-3\cos t-9\sin t}{2}\). \(\mathbf{r}(t)=\left\langle 3\cos t,\ \dfrac{7-3\cos t-9\sin t}{2},\ 3\sin t\right\rangle\), an ellipse. Any parametrization that stays on both surfaces is accepted.`}},

{id:'l-line-plane',topic:'lps',title:'Where a line meets a plane',
 concept:{q:R`How do you find where a line meets a plane? How can you tell when they never meet, or when the line lies inside the plane?`,
  rubric:['Write the line parametrically (x, y, z in terms of t) and substitute into the plane equation.','Solve for t and plug it back into the line to get the point.','If t cancels out: a false statement means the line is parallel to the plane and never meets it; a true statement means the line lies in the plane.'],
  model:R`<p>Feed the line into the plane: substitute \(x(t),y(t),z(t)\) into the plane equation, solve for \(t\), and put that \(t\) back into the line.</p><p>If \(t\) drops out, the direction is perpendicular to the normal (the line is parallel to the plane). Then a false statement like \(3=6\) means no intersection, and a true one like \(6=6\) means the whole line lies in the plane.</p>`},
 app:{source:'Practice',
  prompt:R`Where does the line through \((1,0,2)\) with direction \(\langle 2,1,-1\rangle\) meet the plane \(x+y+z=6\)?`,
  parts:[{k:'P',label:'point:',kind:'vector',ans:[4,1.5,0.5],sol:'(4,3/2,1/2)',placeholder:'(x, y, z)'}],
  solution:R`The line is \((1+2t,\ t,\ 2-t)\). Substitute: \((1+2t)+t+(2-t)=3+2t=6\), so \(t=\tfrac32\). The point is \((1+3,\ \tfrac32,\ 2-\tfrac32)=(4,\tfrac32,\tfrac12)\). Check: \(4+\tfrac32+\tfrac12=6\).`}},

{id:'l-quadric',topic:'lps',title:'Identifying quadric surfaces',
 concept:{q:R`How do you identify a quadric surface from its equation? How do traces help?`,
  rubric:['Traces: fix one variable at a constant and see what curve the other two make (ellipse, hyperbola, parabola, or lines).','Use the pattern of the equation: a variable to the first power means a paraboloid (elliptic if the squared terms have the same sign, hyperbolic if opposite); all squared with mixed signs means a hyperboloid (= 1) or a cone (= 0); all squared, all positive, = 1 is an ellipsoid. The odd variable out gives the axis.'],
  model:R`<p>Slice it: set \(x\), \(y\), or \(z\) equal to a constant and name the curve you get. Stacked ellipses, parabolas, and hyperbolas identify the surface.</p><p>Quick pattern: one variable to the first power is a paraboloid (elliptic if the squares have the same sign, a saddle if opposite). All three squared: all positive and \(=1\) is an ellipsoid; two plus and one minus \(=1\) is a hyperboloid of one sheet; one plus and two minus \(=1\) is two sheets; mixed signs \(=0\) is a cone. The variable that behaves differently is the axis.</p>`},
 app:{source:'Practice',
  prompt:R`Identify each surface.`,
  parts:(()=>{const opts=['ellipsoid','elliptic paraboloid','hyperbolic paraboloid','cone','hyperboloid of one sheet','hyperboloid of two sheets'];
   return [[R`(a) \(z=y^2-x^2\)`,2],[R`(b) \(x^2+y^2-z^2=1\)`,4],[R`(c) \(z^2-x^2-y^2=1\)`,5],[R`(d) \(y=x^2+4z^2\)`,1],[R`(e) \(x^2+y^2=z^2\)`,3]].map(([label,ans],i)=>({k:'q'+i,label,kind:'choice',options:opts,ans}));})(),
  solution:R`(a) \(z\) to the first power, squares with opposite signs: hyperbolic paraboloid (saddle). (b) Traces \(z=k\) are circles \(x^2+y^2=1+k^2\), never empty: hyperboloid of one sheet. (c) Traces \(z=k\) are \(x^2+y^2=k^2-1\), empty for \(|k|\lt 1\): hyperboloid of two sheets. (d) \(y\) to the first power, squares with the same sign: elliptic paraboloid opening along the \(y\)-axis. (e) \(=0\) with mixed signs: a cone, with traces \(z=k\) the circles of radius \(|k|\).`}},

/* ======================================================================== curves */
{id:'c-reparam',topic:'curves',title:'Same curve, different parametrizations',
 concept:{q:R`Two different parametrizations can trace the same curve. What makes them trace the same curve, and in what ways can they still differ?`,
  rubric:['They trace the same set of points; typically one is the other with the parameter changed, like p(g(s)).','They can differ in how much of the curve they cover (the range of g) and in direction (whether g increases or decreases).','They can differ in speed: the speed is |g\'(s)| times the speed of p, so a reparametrization can speed up, slow down, or pause.'],
  model:R`<p>Most reparametrizations have the form \(\mathbf{q}(s)=\mathbf{p}(g(s))\): same points, run on a different clock. Three things can change:</p><p><b>Coverage:</b> the range of \(g\). If \(g(s)=s^2\), only \(t\ge0\) is reached. <b>Direction:</b> the sign of \(g'\); \(g(s)=-s\) runs backward. <b>Speed:</b> by the chain rule \(|\mathbf{q}'(s)|=|g'(s)|\,|\mathbf{p}'(g(s))|\), so \(g(s)=s^3\) pauses at \(s=0\).</p>`},
 app:{source:'Week 3 HW · Problem 5(b)',
  prompt:R`Let \(C\) be the intersection of \(y=x^2\) and \(z=xy\), traced by \(\mathbf{p}(t)=\langle t,t^2,t^3\rangle\). Each of \(\mathbf{q}(u)=\langle u^2,u^4,u^6\rangle\), \(\mathbf{r}(s)=\langle -s,s^2,-s^3\rangle\), \(\mathbf{m}(w)=\langle w^3,w^6,w^9\rangle\) also lies on \(C\). How does each differ from \(\mathbf{p}\)?`,
  parts:(()=>{const o=[R`covers all of \(C\), same direction as \(\mathbf{p}\)`,R`covers all of \(C\), opposite direction`,R`covers only the part with \(x\ge 0\), retracing it`,R`does not stay on \(C\)`];
   return [{k:'q',label:R`\(\mathbf{q}(u)=\langle u^2,u^4,u^6\rangle\):`,kind:'choice',options:o,ans:2},{k:'r',label:R`\(\mathbf{r}(s)=\langle -s,s^2,-s^3\rangle\):`,kind:'choice',options:o,ans:1},{k:'m',label:R`\(\mathbf{m}(w)=\langle w^3,w^6,w^9\rangle\):`,kind:'choice',options:o,ans:0},
    {k:'sp',label:R`Which of them moves at the same speed as \(\mathbf{p}\) at every shared point?`,kind:'choice',options:[R`\(\mathbf{r}\) only`,R`\(\mathbf{m}\) only`,R`both \(\mathbf{r}\) and \(\mathbf{m}\)`,'neither'],ans:0}];})(),
  solution:R`All three are \(\mathbf{p}(g(\cdot))\): \(\mathbf{q}(u)=\mathbf{p}(u^2)\), \(\mathbf{r}(s)=\mathbf{p}(-s)\), \(\mathbf{m}(w)=\mathbf{p}(w^3)\), so each lies on \(C\). Coverage is the range of \(g\): \(u^2\ge 0\) reaches only \(x\ge 0\), while \(-s\) and \(w^3\) reach every \(x\). Direction is the sign of \(g'\): \(2u\) changes sign at \(u=0\) (\(\mathbf{q}\) comes in and goes back out), \(-1\lt 0\) (\(\mathbf{r}\) runs backward), \(3w^2\ge 0\) (\(\mathbf{m}\) runs forward). Speed is \(|g'|\) times the speed of \(\mathbf{p}\): \(|\mathbf{r}'(s)|=|\mathbf{p}'(-s)|\) exactly, but \(|\mathbf{m}'(w)|=3w^2|\mathbf{p}'(w^3)|\), slower for small \(|w|\) and faster beyond.`}},

{id:'c-sphere',topic:'curves',title:'Position perpendicular to velocity',
 concept:{q:R`How do you differentiate a dot product \(\mathbf{u}(t)\cdot\mathbf{v}(t)\) of vector functions? What is \(\dfrac{d}{dt}|\mathbf{r}(t)|^2\)?`,
  rubric:['Product rule: (u · v)\' = u\' · v + u · v\' (cross products work the same way, keeping the order).','|r|^2 = r · r, so d/dt |r|^2 = r\' · r + r · r\' = 2 r · r\'.'],
  model:R`<p>The ordinary product rule carries over: \((\mathbf{u}\cdot\mathbf{v})'=\mathbf{u}'\cdot\mathbf{v}+\mathbf{u}\cdot\mathbf{v}'\), and \((\mathbf{u}\times\mathbf{v})'=\mathbf{u}'\times\mathbf{v}+\mathbf{u}\times\mathbf{v}'\) with the order kept.</p><p>Since \(|\mathbf{r}|^2=\mathbf{r}\cdot\mathbf{r}\), \(\dfrac{d}{dt}|\mathbf{r}|^2=2\,\mathbf{r}\cdot\mathbf{r}'\). So \(\mathbf{r}\cdot\mathbf{r}'=0\) exactly when the distance from the origin is not changing.</p>`},
 app:{source:'Week 4 HW · Problem 1',
  prompt:R`Let \(\mathbf{p}:\mathbb{R}\to\mathbb{R}^3\) be a vector-valued function with \(\mathbf{p}(t)\cdot\mathbf{p}'(t)=0\) for all \(t\). Show that the curve lies on a sphere centered at the origin. Write the argument; the tutor grades it.`,
  parts:[{k:'pf',kind:'written',rubric:['States the goal: a sphere centered at the origin is where |r| = R for a constant R, so show |p(t)| is constant.','Differentiates |p|^2 = p · p with the product rule to get 2 p · p\'.','Uses p · p\' = 0 to conclude the derivative of |p|^2 is 0, so |p(t)|^2 is a constant R^2, and every point of the curve is on the sphere of radius R about the origin.']}],
  solution:R`A sphere centered at the origin is the set where \(|\mathbf{r}|=R\), so show \(|\mathbf{p}(t)|\) is constant. \(\dfrac{d}{dt}|\mathbf{p}(t)|^2=\dfrac{d}{dt}\big(\mathbf{p}\cdot\mathbf{p}\big)=\mathbf{p}'\cdot\mathbf{p}+\mathbf{p}\cdot\mathbf{p}'=2\,\mathbf{p}\cdot\mathbf{p}'=0\) for all \(t\). A function with zero derivative everywhere is constant, so \(|\mathbf{p}(t)|^2=R^2\) and every point \(\mathbf{p}(t)\) is on the sphere \(x^2+y^2+z^2=R^2\).`}},

{id:'c-cross-zero',topic:'curves',title:'Position parallel to velocity',
 concept:{q:R`What does \(\mathbf{p}(t)\times\mathbf{p}'(t)=\mathbf{0}\) say about how the position vector and the velocity are related?`,
  rubric:['A cross product of nonzero vectors is zero exactly when they are parallel.','So the velocity always points along the position vector, straight toward or away from the origin, never sideways.'],
  model:R`<p>The cross product of two nonzero vectors vanishes exactly when they are parallel. So the velocity always lies along the position vector: the particle moves straight toward or straight away from the origin and never has a sideways component that would change its direction.</p>`},
 app:{source:'Week 4 HW · Problem 2',
  prompt:R`Now suppose instead that \(\mathbf{p}(t)\times\mathbf{p}'(t)=\mathbf{0}\) for all \(t\) and \(\mathbf{p}(t)\ne\mathbf{0}\) for all \(t\). What does the curve look like?`,
  parts:[{k:'s',kind:'choice',options:['It lies on a sphere centered at the origin','It stays on one ray from the origin (part of a line through the origin)','It is a circle centered at the origin','It can be any curve in a plane through the origin'],ans:1}],
  solution:R`Write \(\mathbf{p}=|\mathbf{p}|\,\mathbf{u}\) with \(\mathbf{u}\) a unit vector. Then \(\mathbf{p}'=|\mathbf{p}|'\mathbf{u}+|\mathbf{p}|\mathbf{u}'\) and \(\mathbf{p}\times\mathbf{p}'=|\mathbf{p}|^2\,\mathbf{u}\times\mathbf{u}'\) (because \(\mathbf{u}\times\mathbf{u}=\mathbf{0}\)). So \(\mathbf{u}\times\mathbf{u}'=\mathbf{0}\): \(\mathbf{u}'\) is parallel to \(\mathbf{u}\). But \(|\mathbf{u}|=1\) is constant, so \(\mathbf{u}\cdot\mathbf{u}'=0\) (the previous item): \(\mathbf{u}'\) is also perpendicular to \(\mathbf{u}\). Both at once forces \(\mathbf{u}'=\mathbf{0}\). The direction never changes, so the point moves in and out along one ray from the origin, and it cannot pass through the origin because \(\mathbf{p}\ne\mathbf{0}\).`}},

{id:'c-angle-curves',topic:'curves',title:'Angle between two crossing curves',
 concept:{q:R`What is "the angle between two curves" at a point where they cross? Why should the two curves get different parameter names when you look for the crossing?`,
  rubric:['It is the angle between their tangent vectors (derivatives) at the crossing point, found with the dot product formula.','The curves can reach the crossing point at different parameter values, so solve q(t) = r(s) with separate t and s; one shared letter would only find a collision, where both are there at the same time.'],
  model:R`<p>Curves cross at a point, not necessarily at the same time. Solve \(\mathbf{q}(t)=\mathbf{r}(s)\) with two independent parameters; using one letter looks for a collision and can miss the crossing.</p><p>The angle is the angle between the tangent vectors there: \(\cos\theta=\dfrac{\mathbf{q}'(t_0)\cdot\mathbf{r}'(s_0)}{|\mathbf{q}'(t_0)||\mathbf{r}'(s_0)|}\).</p>`},
 app:{source:'Week 4 HW · Problem 3',
  prompt:R`At what point do \(\mathbf{q}(t)=\langle t,\,1-t,\,3+t^2\rangle\) and \(\mathbf{r}(s)=\langle 3-s,\,s-2,\,s^2\rangle\) intersect? Find their angle of intersection.`,
  parts:[{k:'P',label:'point:',kind:'vector',ans:[1,0,4],sol:'(1,0,4)',placeholder:'(x, y, z)'},{k:'c',label:R`\(\cos\theta=\)`,kind:'number',ans:1/Math.sqrt(3),sol:'1/sqrt(3)'},{k:'deg',label:R`\(\theta\approx\)`,after:'degrees, one decimal',kind:'number',ans:54.736,tol:0.05,sol:'54.7'}],
  solution:R`Match coordinates: \(t=3-s\) and \(1-t=s-2\) (the same equation again), then \(3+t^2=s^2\) gives \(3+(3-s)^2=s^2\), \(12-6s=0\), \(s=2\), \(t=1\). Point: \(\mathbf{q}(1)=\mathbf{r}(2)=(1,0,4)\). Tangents: \(\mathbf{q}'(1)=\langle 1,-1,2\rangle\), \(\mathbf{r}'(2)=\langle -1,1,4\rangle\). \(\cos\theta=\dfrac{-1-1+8}{\sqrt6\,\sqrt{18}}=\dfrac{6}{6\sqrt3}=\dfrac1{\sqrt3}\), \(\theta\approx 54.7^\circ\). The curves get there at different times, \(t=1\) and \(s=2\).`}},

{id:'c-arclength',topic:'curves',title:'Arc length of an intersection curve',
 concept:{q:R`Why is arc length \(\displaystyle\int_a^b|\mathbf{r}'(t)|\,dt\)? When the curve is the intersection of two surfaces, how do you get an \(\mathbf{r}(t)\) to use it on?`,
  rubric:['|r\'(t)| is the speed; over a short time dt the curve covers about |r\'(t)| dt of distance, and integrating adds those pieces into the total length.','For an intersection curve, pick one variable as the parameter (for example x = t) and solve the two surface equations for the other coordinates in terms of it, tracing the curve once over the interval.'],
  model:R`<p>\(|\mathbf{r}'(t)|\) is speed. In a short time \(dt\) you travel about \(|\mathbf{r}'(t)|\,dt\), and the integral adds up those tiny lengths: distance is the integral of speed.</p><p>For an intersection, choose a convenient parameter (often one of the variables, \(x=t\)), then solve the two equations for the other coordinates. Make sure the parameter interval traces the curve exactly once.</p>`},
 app:{source:'Week 4 HW · Problem 4',
  prompt:R`Write an integral for the length of the curve where \(y+z=x^3\) and \(z=4x^2+y\) intersect, for \(-1\le x\le 1\). Use \(x\) as the parameter. You do not need to evaluate it.`,
  parts:[{k:'y',label:R`\(y(x)=\)`,kind:'expr',vars:['x'],ans:e=>(e.x**3-4*e.x**2)/2,sol:'(x^3-4x^2)/2'},{k:'z',label:R`\(z(x)=\)`,kind:'expr',vars:['x'],ans:e=>(e.x**3+4*e.x**2)/2,sol:'(x^3+4x^2)/2'},
   {k:'f',label:R`\(L=\displaystyle\int_{-1}^{1}\)`,after:R`\(\,dx\)`,kind:'expr',vars:['x'],ans:e=>Math.sqrt(1+(9*e.x**4+64*e.x**2)/2),sol:'sqrt(1+(9x^4+64x^2)/2)'}],
  solution:R`Substitute \(z=4x^2+y\) into \(y+z=x^3\): \(2y+4x^2=x^3\), so \(y=\dfrac{x^3-4x^2}{2}\) and \(z=4x^2+y=\dfrac{x^3+4x^2}{2}\). Then \(\mathbf{r}'(x)=\left\langle 1,\tfrac{3x^2-8x}{2},\tfrac{3x^2+8x}{2}\right\rangle\) and \(|\mathbf{r}'|^2=1+\tfrac{(3x^2-8x)^2+(3x^2+8x)^2}{4}=1+\tfrac{9x^4+64x^2}{2}\) (the cross terms cancel). \(L=\displaystyle\int_{-1}^{1}\sqrt{1+\tfrac{9x^4+64x^2}{2}}\,dx\).`}},

{id:'c-accel',topic:'curves',title:'Velocity and acceleration on a path',
 concept:{q:R`At a point on a path, which way do the velocity and acceleration vectors point when the particle is speeding up, slowing down, or going around a bend?`,
  rubric:['Velocity is tangent to the path, pointing in the direction of motion.','Acceleration has a tangential part (along the velocity when speeding up, against it when slowing down) and a normal part pointing toward the inside of the bend (zero where the path is straight).','So slowing down on a bend means the acceleration points backward and toward the inside, at an obtuse angle to the velocity.'],
  model:R`<p>Velocity is tangent to the path, in the direction of travel. Acceleration splits into two parts: a tangential part that changes the speed (forward when speeding up, backward when slowing down) and a normal part that changes the direction, always toward the inside (concave side) of the bend.</p><p>Slowing down on a bend: backward plus inward, so the acceleration makes an obtuse angle with the velocity. Constant speed on a bend: purely inward, perpendicular to the velocity.</p>`},
 app:{source:'Week 4 HW · Problem 5',
  prompt:R`A particle travels this path from \(A\) to \(B\) with speed that is always decreasing. At each marked point, which numbered arrow could be the acceleration?`,
  fig:pathFig,
  parts:[{k:'p1',label:R`At \(P_1\) (upper left):`,kind:'choice',options:['arrow 1','arrow 2','arrow 3','arrow 4'],ans:2},{k:'p2',label:R`At \(P_2\) (lower right):`,kind:'choice',options:['arrow 1','arrow 2','arrow 3','arrow 4'],ans:0}],
  solution:R`The velocity (dashed blue) is tangent and points toward \(B\). Slowing down needs a component against the velocity; turning needs a component toward the inside of the bend. At \(P_1\) the path curls clockwise over the top, so the inside is below and to the right: arrow 3, backward and inward. At \(P_2\) the path is flattening out as it bends to the left, so the inside is above: arrow 1, backward and up. In both cases the acceleration makes an obtuse angle with the velocity.`}},

{id:'c-lineint',topic:'curves',title:'Scalar line integral',
 concept:{q:R`How do you compute a scalar line integral \(\displaystyle\int_C f\,ds\)? How is it related to arc length?`,
  rubric:['Parametrize C by r(t), a ≤ t ≤ b.','Replace ds by |r\'(t)| dt and f by f(r(t)): the integral becomes the integral from a to b of f(r(t)) |r\'(t)| dt.','With f = 1 it is exactly the arc length; in general it adds up f weighted by length, like total mass from a density.'],
  model:R`<p>Parametrize \(C\) by \(\mathbf{r}(t)\), \(a\le t\le b\). The element of length is \(ds=|\mathbf{r}'(t)|\,dt\), so \(\displaystyle\int_C f\,ds=\int_a^b f(\mathbf{r}(t))\,|\mathbf{r}'(t)|\,dt\).</p><p>With \(f=1\) this is the arc length. In general it weights each bit of length by \(f\), like mass from a linear density. The answer does not depend on the parametrization or the direction of travel.</p>`},
 app:{source:'Practice',
  prompt:R`Evaluate \(\displaystyle\int_C xyz\,ds\), where \(C\) is the line segment from \((0,0,0)\) to \((1,2,2)\).`,
  parts:[{k:'v',label:'value =',kind:'number',ans:3,sol:'3'}],
  solution:R`\(\mathbf{r}(t)=\langle t,2t,2t\rangle\), \(0\le t\le1\), so \(|\mathbf{r}'(t)|=|\langle 1,2,2\rangle|=3\). On the segment \(xyz=4t^3\). \(\displaystyle\int_0^1 4t^3\cdot 3\,dt=3\). Forgetting the factor \(|\mathbf{r}'|=3\) gives 1.`}},

{id:'c-tangent-line',topic:'curves',title:'Tangent line to a space curve',
 concept:{q:R`How do you find the tangent line to a space curve \(\mathbf{r}(t)\) at a given point?`,
  rubric:['Find the parameter value t0 with r(t0) equal to the given point.','The direction of the line is the derivative r\'(t0), and the line is r(t0) + s r\'(t0).'],
  model:R`<p>First find the parameter value \(t_0\) that lands on the point. The tangent direction is \(\mathbf{r}'(t_0)\), so the line is \(\mathbf{r}(t_0)+s\,\mathbf{r}'(t_0)\). Plugging the point's coordinates into \(\mathbf{r}'\) instead of \(t_0\) is the usual slip.</p>`},
 app:{source:'Practice',
  prompt:R`Find the tangent line to \(\mathbf{r}(t)=\langle t^2,\,t^3,\,2t\rangle\) at the point \((1,-1,-2)\). Use \(t\) as the line's parameter.`,
  parts:[{k:'L',label:'line:',kind:'line',P:[1,-1,-2],d:[-2,3,2],sol:'<1-2t,-1+3t,-2+2t>',xwide:true,placeholder:'<x(t), y(t), z(t)>'}],
  solution:R`\(2t=-2\) gives \(t_0=-1\), and \(\mathbf{r}(-1)=\langle 1,-1,-2\rangle\) checks. \(\mathbf{r}'(t)=\langle 2t,3t^2,2\rangle\), so \(\mathbf{r}'(-1)=\langle -2,3,2\rangle\). Tangent line: \(\langle 1-2t,\,-1+3t,\,-2+2t\rangle\).`}},

{id:'c-curvature',topic:'curves',title:'Curvature',
 concept:{q:R`What does the curvature \(\kappa\) measure, and why is it defined with respect to arc length instead of \(t\)?`,
  rubric:['Curvature measures how fast the curve turns: kappa = |dT/ds|, the rate of change of the unit tangent per unit of distance along the curve.','Measuring per unit of arc length makes it depend only on the shape, not on how fast the parametrization moves along the curve.'],
  model:R`<p>\(\kappa=\left|\dfrac{d\mathbf{T}}{ds}\right|\): how quickly the direction of travel turns per unit of distance. Measuring against arc length rather than \(t\) makes it a property of the shape alone; running along the curve faster would otherwise change the answer.</p><p>Computing: \(\kappa=\dfrac{|\mathbf{r}'\times\mathbf{r}''|}{|\mathbf{r}'|^3}\) or \(\dfrac{|\mathbf{T}'(t)|}{|\mathbf{r}'(t)|}\). A line has \(\kappa=0\); a circle of radius \(R\) has \(\kappa=1/R\).</p>`},
 app:{source:'Practice',
  prompt:R`Find the curvature of the helix \(\mathbf{r}(t)=\langle 3\cos t,\,3\sin t,\,4t\rangle\).`,
  parts:[{k:'k',label:R`\(\kappa=\)`,kind:'number',ans:3/25,sol:'3/25'}],
  solution:R`\(\mathbf{r}'=\langle -3\sin t,3\cos t,4\rangle\), \(|\mathbf{r}'|=5\). \(\mathbf{r}''=\langle -3\cos t,-3\sin t,0\rangle\). \(\mathbf{r}'\times\mathbf{r}''=\langle 12\sin t,\,-12\cos t,\,9\rangle\), length \(\sqrt{144+81}=15\). \(\kappa=\dfrac{15}{125}=\dfrac{3}{25}\), constant, as a helix should be.`}},

/* ======================================================================== partial derivatives */
{id:'p-limit',topic:'partials',title:'Limits that depend on the path',
 concept:{q:R`How do you show that \(\displaystyle\lim_{(x,y)\to(0,0)}f(x,y)\) does not exist? Why does getting the same value along every straight line not prove that it does exist?`,
  rubric:['The limit exists only if f approaches the same value along every path into the point.','To show it does not exist, find two paths that give different values.','Agreement along all lines is not a proof, because some other path (a parabola, say) can still give a different value; proving existence needs a bound such as the squeeze theorem or polar coordinates.'],
  model:R`<p>The limit has to be the same no matter how you approach. Two paths with different values prove it does not exist.</p><p>Matching values along every line through the origin only suggest a limit: curved paths are not lines, and a parabola can still disagree. To prove a limit exists you need a bound, such as \(|f(x,y)-L|\le g\) with \(g\to 0\) (squeeze), often in polar coordinates.</p>`},
 app:{source:'Practice',
  prompt:R`Consider \(f(x,y)=\dfrac{xy^2}{x^2+y^4}\) near \((0,0)\).`,
  parts:[{k:'m',label:R`limit along any line \(y=mx\):`,kind:'number',ans:0,sol:'0'},{k:'p',label:R`limit along the parabola \(x=y^2\):`,kind:'number',ans:0.5,sol:'1/2'},{k:'L',label:R`\(\displaystyle\lim_{(x,y)\to(0,0)}f(x,y)=\)`,kind:'number',ans:'DNE',sol:'DNE',placeholder:'a number, or DNE'}],
  solution:R`Along \(y=mx\): \(\dfrac{m^2x^3}{x^2+m^4x^4}=\dfrac{m^2x}{1+m^4x^2}\to 0\), and the axes give 0 too. Along \(x=y^2\): \(\dfrac{y^4}{y^4+y^4}=\dfrac12\). Two paths, two values, so the limit does not exist.`}},

{id:'p-partial',topic:'partials',title:'What a partial derivative means',
 concept:{q:R`What does \(f_x(a,b)\) mean geometrically, and how do you compute it?`,
  rubric:['It is the rate of change of f as x changes while y is held fixed at b.','Geometrically it is the slope of the curve cut from the graph by the plane y = b, at x = a.','Compute it by treating y as a constant and differentiating with respect to x, then plugging in (a, b).'],
  model:R`<p>\(f_x(a,b)\) is the rate of change of \(f\) when only \(x\) moves and \(y\) stays at \(b\). On the graph, slice with the plane \(y=b\): you get a curve \(z=f(x,b)\), and \(f_x(a,b)\) is its slope at \(x=a\).</p><p>To compute it, treat \(y\) as a constant, differentiate in \(x\), then plug in.</p>`},
 app:{source:'Week 5 HW · Problem 3',
  prompt:R`A factory's output is modeled by \(O(L,C)=0.01\,L^{0.8}C^{0.6}\), where \(L\) is the money invested in labor and \(C\) the money invested in capital. Currently \(L=C=100{,}000\). Find the partial derivatives there.`,
  parts:[{k:'L',label:R`\(O_L(100000,100000)=\)`,kind:'number',ans:0.8,sol:'0.8'},{k:'C',label:R`\(O_C(100000,100000)=\)`,kind:'number',ans:0.6,sol:'0.6'}],
  solution:R`\(O_L=0.008\,L^{-0.2}C^{0.6}\). At \(L=C=10^5\), \(L^{-0.2}C^{0.6}=(10^5)^{0.4}=10^2\), so \(O_L=0.8\). \(O_C=0.006\,L^{0.8}C^{-0.4}=0.006\cdot(10^5)^{0.4}=0.6\). Each extra dollar of labor adds about 0.8 units of output, each extra dollar of capital about 0.6.`}},

{id:'p-clairaut',topic:'partials',title:"Clairaut's theorem",
 concept:{q:R`What does Clairaut's theorem say, and how does it let you evaluate a long string of mixed partial derivatives without doing them in the given order?`,
  rubric:['If the mixed partials are continuous, the order of differentiation does not matter: f_xy = f_yx, and the same holds for higher-order mixed partials.','So you can reorder the derivatives and do the easiest ones first, for example the ones that make terms vanish.'],
  model:R`<p>If the mixed partials are continuous near the point, \(f_{xy}=f_{yx}\), and by repeating the argument any string of partials can be reordered. So choose the order that makes the work easy: differentiate first in a variable that kills terms quickly.</p>`},
 app:{source:'Week 5 HW · Problem 2',
  prompt:R`Let \(f(x,y,z)=\dfrac{y^2e^z\cos x}{1+z^2x^2}+\arctan^2(xz)\). Compute \(f_{xxzzyxzxyzxxzxzxy}\), seventeen partial derivatives. You should not need seventeen derivatives.`,
  parts:[{k:'v',label:'value =',kind:'number',ans:0,sol:'0'}],
  solution:R`All the partials of \(f\) are continuous, so by Clairaut the order does not matter. The string contains \(y\) three times, so do those first. The second term has no \(y\), so one \(y\)-derivative kills it. The first term is \(y^2\) times a function of \(x\) and \(z\), and three \(y\)-derivatives of \(y^2\) give 0. The answer is \(0\).`}},

{id:'p-tangent-plane',topic:'partials',title:'Tangent planes to graphs',
 concept:{q:R`How should you think about finding the tangent plane to the surface \(z=f(x,y)\) at \((a,b)\)? What do the numbers in its equation mean?`,
  rubric:['The tangent plane passes through the point (a, b, f(a,b)) on the surface.','Its slopes in the x and y directions match the surface: f_x(a,b) and f_y(a,b). So z = f(a,b) + f_x(a,b)(x - a) + f_y(a,b)(y - b).','Process: compute f(a,b), f_x(a,b), f_y(a,b) and plug them in.'],
  model:R`<p>The tangent plane is the plane through \((a,b,f(a,b))\) that tilts like the surface: its slope in the \(x\)-direction is \(f_x(a,b)\) and in the \(y\)-direction is \(f_y(a,b)\). That is exactly \(z=f(a,b)+f_x(a,b)(x-a)+f_y(a,b)(y-b)\).</p><p>So the process is three numbers: the height and the two partials at the point. Equivalently, the normal vector is \(\langle f_x,f_y,-1\rangle\).</p>`},
 app:{source:'Week 5 HW · Problem 1',
  prompt:R`The equation \(4x-2y+3z=17\) describes the tangent plane to the graph of \(f:\mathbb{R}^2\to\mathbb{R}\) at \((x,y)=(3,1)\). What are \(f(3,1)\), \(f_x(3,1)\), and \(f_y(3,1)\)?`,
  parts:[{k:'f',label:R`\(f(3,1)=\)`,kind:'number',ans:7/3,sol:'7/3'},{k:'fx',label:R`\(f_x(3,1)=\)`,kind:'number',ans:-4/3,sol:'-4/3'},{k:'fy',label:R`\(f_y(3,1)=\)`,kind:'number',ans:2/3,sol:'2/3'}],
  solution:R`Solve the plane for \(z\): \(z=\dfrac{17-4x+2y}{3}\). The plane touches the graph above \((3,1)\), so \(f(3,1)=\dfrac{17-12+2}{3}=\dfrac73\). Its slopes are the partials: the coefficient of \(x\) is \(f_x(3,1)=-\tfrac43\) and of \(y\) is \(f_y(3,1)=\tfrac23\). Check: \(\tfrac73-\tfrac43(x-3)+\tfrac23(y-1)\) expands to \(\tfrac{17-4x+2y}{3}\).`}},

{id:'p-linear',topic:'partials',title:'Linear approximation',
 concept:{q:R`What is the linearization \(L(x,y)\) of \(f\) at \((a,b)\), and how do you use it to estimate the change in \(f\) for small changes in \(x\) and \(y\)?`,
  rubric:['L(x,y) = f(a,b) + f_x(a,b)(x - a) + f_y(a,b)(y - b), the height of the tangent plane.','Near (a,b), f ≈ L, so the change is Δf ≈ f_x Δx + f_y Δy (the differential df), good for small changes.'],
  model:R`<p>\(L(x,y)=f(a,b)+f_x(a,b)(x-a)+f_y(a,b)(y-b)\) is the tangent plane used as an approximation. Near \((a,b)\), \(f\approx L\), so a small change costs \(\Delta f\approx f_x\,\Delta x+f_y\,\Delta y\). Each partial is an exchange rate: output per unit of its input. The estimate is only trustworthy for small changes.</p>`},
 app:{source:'Week 5 HW · Problem 3(a)',
  prompt:R`Same factory: \(O(L,C)=0.01\,L^{0.8}C^{0.6}\) at \(L=C=100{,}000\), where \(O_L=0.8\) and \(O_C=0.6\). The owners find seven more dollars to invest. Estimate the extra output for each option.`,
  parts:[{k:'a',label:R`\(L\) up by 7:`,kind:'number',ans:5.6,sol:'5.6'},{k:'b',label:R`\(C\) up by 7:`,kind:'number',ans:4.2,sol:'4.2'},{k:'c',label:R`\(L\) up by 4 and \(C\) up by 3:`,kind:'number',ans:5,sol:'5'},
   {k:'best',label:'Best option:',kind:'choice',options:['all 7 into labor','all 7 into capital','split 4 and 3'],ans:0}],
  solution:R`\(\Delta O\approx O_L\,\Delta L+O_C\,\Delta C=0.8\,\Delta L+0.6\,\Delta C\). Labor only: \(0.8\cdot7=5.6\). Capital only: \(0.6\cdot7=4.2\). Split: \(0.8\cdot4+0.6\cdot3=5.0\). Labor has the higher exchange rate, so all 7 dollars go there. Seven dollars against \(100{,}000\) is tiny, so the linear estimate is very accurate.`}},

/* ======================================================================== gradient, chain rule */
{id:'g-grad-mag',topic:'grad',title:'Direction and magnitude of the gradient',
 concept:{q:R`What does the direction of \(\nabla f(a,b)\) tell you, and what does its magnitude \(|\nabla f(a,b)|\) represent?`,
  rubric:['Direction: the gradient points in the direction of steepest ascent, where f increases fastest.','Magnitude: |∇f| is that fastest rate of increase, the largest directional derivative at the point.'],
  model:R`<p>\(\nabla f\) points the way \(f\) increases fastest, and \(|\nabla f|\) is that fastest rate: the largest directional derivative at the point. This follows from \(D_{\mathbf{u}}f=\nabla f\cdot\mathbf{u}=|\nabla f|\cos\theta\), which is largest when \(\mathbf{u}\) points along \(\nabla f\).</p><p>Also: \(-\nabla f\) is steepest descent at rate \(-|\nabla f|\), and directions perpendicular to \(\nabla f\) (along the level curve) have rate 0.</p>`},
 app:{source:'Week 5 HW · Problem 3(b)',
  prompt:R`For \(O(L,C)=0.01\,L^{0.8}C^{0.6}\) at \((100000,100000)\), in which direction is the directional derivative greatest, and what is that greatest directional derivative?`,
  parts:[{k:'u',label:'direction (unit vector):',kind:'vector',ans:[0.8,0.6],sameDir:true,sol:'<0.8,0.6>'},{k:'m',label:'greatest directional derivative:',kind:'number',ans:1,sol:'1'}],
  solution:R`\(\nabla O=\langle O_L,O_C\rangle=\langle 0.8,0.6\rangle\). The directional derivative is greatest in the gradient's direction, \(\mathbf{u}=\langle 0.8,0.6\rangle\) (already a unit vector), and its value there is \(|\nabla O|=\sqrt{0.64+0.36}=1\).`}},

{id:'g-dirderiv',topic:'grad',title:'Computing a directional derivative',
 concept:{q:R`How do you compute the directional derivative \(D_{\mathbf{u}}f\), and why must \(\mathbf{u}\) be a unit vector?`,
  rubric:['D_u f = ∇f · u.','u must be a unit vector so the result is the rate of change per unit of distance; normalize the given direction first.'],
  model:R`<p>\(D_{\mathbf{u}}f=\nabla f\cdot\mathbf{u}\). It is a rate per unit of distance, so \(\mathbf{u}\) must have length 1: divide the given direction by its length first. A direction of length 5 would make the answer five times too big.</p><p>Since \(\nabla f\cdot\mathbf{u}=|\nabla f|\cos\theta\), every directional derivative lies between \(-|\nabla f|\) and \(|\nabla f|\).</p>`},
 app:{source:'Practice',
  prompt:R`Find the directional derivative of \(f(x,y)=x^2y-3y\) at \((2,1)\) in the direction of \(\langle 3,4\rangle\).`,
  parts:[{k:'D',label:R`\(D_{\mathbf{u}}f(2,1)=\)`,kind:'number',ans:3.2,sol:'16/5'}],
  solution:R`\(\nabla f=\langle 2xy,\;x^2-3\rangle\), so \(\nabla f(2,1)=\langle 4,1\rangle\). Normalize: \(\mathbf{u}=\tfrac15\langle 3,4\rangle\). \(D_{\mathbf{u}}f=4\cdot\tfrac35+1\cdot\tfrac45=\tfrac{16}{5}\). Skipping the normalization gives 16.`}},

{id:'g-contour-signs',topic:'grad',title:'Reading partial derivatives off a contour map',
 concept:{q:R`On a contour map with no formula, how do you read the sign of \(f_x\) at a point? How do you read the sign of \(f_{xx}\)?`,
  rubric:['f_x: move a little in the +x direction (to the right) and see whether you cross toward higher or lower labeled levels: higher means f_x > 0, lower means f_x < 0, staying on the level curve means 0.','f_xx: ask whether f_x increases as x increases, using the spacing of the level curves along the horizontal line. Climbing with curves getting closer together, or descending with curves spreading apart, means f_xx > 0.'],
  model:R`<p><b>\(f_x\):</b> walk to the right from the point. Crossing toward higher labels means \(f_x\gt 0\); toward lower labels, \(f_x\lt 0\); running along the level curve, \(f_x=0\).</p><p><b>\(f_{xx}\):</b> is \(f_x\) itself growing as you keep walking right? Watch the spacing. Climbing through curves that get closer together means the climb steepens: \(f_{xx}\gt 0\). Descending through curves that spread apart means the descent is easing, the slope is rising toward 0: also \(f_{xx}\gt 0\). The other two combinations give \(f_{xx}\lt 0\). Same idea vertically for \(f_y\) and \(f_{yy}\).</p>`},
 app:{source:'Week 5 HW · Problem 5(a)',
  prompt:R`The map shows level curves of \(f(x,y)\), each labeled with its value. Every answer must come from the map. Give the sign of each quantity at \(A=(1,-2)\) and \(B=(-2,2)\).`,
  fig:mapFig,
  parts:(()=>{const o=['+','−','0'];return [[R`At \(A\): \(f_x\)`,1],[R`At \(A\): \(f_y\)`,1],[R`At \(A\): \(f_{xx}\)`,0],[R`At \(A\): \(f_{yy}\)`,0],[R`At \(B\): \(f_x\)`,0],[R`At \(B\): \(f_y\)`,0],[R`At \(B\): \(f_{xx}\)`,1],[R`At \(B\): \(f_{yy}\)`,0]].map(([label,ans],i)=>({k:'s'+i,label,kind:'choice',options:o,ans}));})(),
  solution:R`\(A\) sits on the 0 curve at the bottom of the oval, and the inside of the oval is lower (it surrounds a minimum). Stepping right or up from \(A\) goes into the oval, so \(f_x\lt 0\) and \(f_y\lt 0\). Keep walking right (or up) and you pass the bottom of the dip and start climbing, so the slope goes from negative to positive: \(f_{xx}\gt 0\) and \(f_{yy}\gt 0\). At \(B\), stepping right crosses toward higher values (from about \(-3\) toward 0), so \(f_x\gt 0\), and the curves spread apart as you climb, so the climb eases: \(f_{xx}\lt 0\). The curves near \(B\) are nearly vertical, so \(f\) changes slowly in \(y\); the hardest cells are \(f_y\) and \(f_{yy}\) there. The formula behind the map, \(f=x^3-3x+xy+y^2\), settles them: \(f_y=x+2y=2\gt 0\) and \(f_{yy}=2\gt 0\) at \(B\).`}},

{id:'g-grad-level',topic:'grad',title:'Gradient versus level curves',
 concept:{q:R`How is the gradient related to level curves? How does that let you read \(|\nabla f|\) and the steepest-ascent direction off a contour map?`,
  rubric:['∇f at a point is perpendicular to the level curve through that point and points toward higher values.','|∇f| is large where the level curves are packed close together and small where they are spread out.','Moving along the level curve (perpendicular to ∇f) gives a directional derivative of zero.'],
  model:R`<p>\(\nabla f\) is perpendicular to the level curve through the point and points toward higher labels. Steepest ascent is straight across the contours, uphill.</p><p>\(|\nabla f|\) is the change in \(f\) per unit distance straight across, so tightly packed curves mean a large gradient and widely spaced curves a small one. Walking along a level curve keeps \(f\) constant: the directional derivative there is 0.</p>`},
 app:{source:'Week 5 HW · Problem 5(b)(c)',
  prompt:R`Same contour map. (b) At which point is \(|\nabla f|\) larger? (c) Give a vector pointing in the direction of steepest ascent from \(A\), and a vector pointing from \(B\) in a direction along which the directional derivative of \(f\) is zero. Directions only need to be right to within about 20°.`,
  fig:mapFig,
  parts:[{k:'big',label:R`(b) \(|\nabla f|\) is larger at`,kind:'choice',options:['A','B','neither: they are equal'],ans:1},
   {k:'up',label:R`(c) steepest ascent from \(A\):`,kind:'custom',check:dirNear([-2,-3],25),sol:'<-2,-3>',placeholder:'<a, b>'},
   {k:'zero',label:R`(c) zero rate of change from \(B\):`,kind:'custom',check:perpNear([11,2],15),sol:'<2,-11>',placeholder:'<a, b>'}],
  solution:R`(b) At \(B\): the level curves there are packed tightly, while around \(A\) they are far apart. Closer curves mean more change per unit distance. (c) At \(A\), steepest ascent crosses the 0 curve perpendicularly, heading out of the oval toward higher values: down and to the left. At \(B\), a zero-rate direction runs along the level curve through \(B\), nearly straight up or down. With the formula behind the map, \(f=x^3-3x+xy+y^2\): \(\nabla f(A)=\langle -2,-3\rangle\) and \(\nabla f(B)=\langle 11,2\rangle\), so \(|\nabla f(A)|=\sqrt{13}\approx3.6\) versus \(|\nabla f(B)|=\sqrt{125}\approx11.2\), and \(\langle 2,-11\rangle\) is a zero-rate direction at \(B\).`}},

{id:'g-tangent-line-int',topic:'grad',title:'Tangent line to an intersection of surfaces',
 concept:{q:R`How do you find the tangent line to the curve where two surfaces intersect, without parametrizing the curve?`,
  rubric:['The curve lies on both surfaces, so its tangent line lies in both tangent planes.','So the direction is perpendicular to both normal vectors: take their cross product n1 x n2.','The normals come from gradients: write each surface as a level surface F(x,y,z) = k (for z = f(x,y), use F = f(x,y) - z) and evaluate ∇F at the point.'],
  model:R`<p>The curve lies in both surfaces, so its tangent line lies in both tangent planes and is perpendicular to both normals. The direction is \(\mathbf{n}_1\times\mathbf{n}_2\).</p><p>Get each normal as a gradient: write the surface as \(F(x,y,z)=k\) (a graph \(z=f(x,y)\) becomes \(F=f(x,y)-z=0\)) and evaluate \(\nabla F\) at the point. A plane's normal is just its coefficients. Then the line is the point plus \(t\) times the direction.</p>`},
 app:{source:'Week 5 HW · Problem 4',
  prompt:R`The graph of \(f(x,y)=x^2-y^2\) meets the plane \(-x+y+3z=8\) in a curve through \((2,1,3)\). Parametrize the tangent line to that curve at \((2,1,3)\).`,
  parts:[{k:'L',label:'tangent line:',kind:'line',P:[2,1,3],d:[-5,-11,2],sol:'<2-5t,1-11t,3+2t>',xwide:true,placeholder:'<x(t), y(t), z(t)>'}],
  solution:R`Surface: \(F=x^2-y^2-z=0\), \(\nabla F=\langle 2x,-2y,-1\rangle=\langle 4,-2,-1\rangle\) at the point. Plane normal: \(\langle -1,1,3\rangle\). Direction: \(\langle 4,-2,-1\rangle\times\langle -1,1,3\rangle=\langle -6+1,\;1-12,\;4-2\rangle=\langle -5,-11,2\rangle\). Line: \(\langle 2-5t,\;1-11t,\;3+2t\rangle\). Check: the direction is perpendicular to both normals (\(-20+22-2=0\) and \(5-11+6=0\)).`}},

{id:'g-level-surface',topic:'grad',title:'Tangent plane to a level surface',
 concept:{q:R`Why is \(\nabla F(a,b,c)\) normal to the level surface \(F(x,y,z)=k\) through that point? How do you use it to write the tangent plane?`,
  rubric:['Any curve r(t) on the surface satisfies F(r(t)) = k; differentiating with the chain rule gives ∇F · r\'(t) = 0.','So ∇F is perpendicular to every tangent direction of the surface: it is a normal vector.','Tangent plane: ∇F(P) · ⟨x - a, y - b, z - c⟩ = 0.'],
  model:R`<p>Take any curve \(\mathbf{r}(t)\) lying in the surface. Then \(F(\mathbf{r}(t))=k\) for all \(t\), and the chain rule gives \(\nabla F\cdot\mathbf{r}'(t)=0\). Every tangent direction of the surface is perpendicular to \(\nabla F\), so \(\nabla F\) is a normal vector.</p><p>Tangent plane at \(P=(a,b,c)\): \(F_x(P)(x-a)+F_y(P)(y-b)+F_z(P)(z-c)=0\).</p>`},
 app:{source:'Practice',
  prompt:R`Find the tangent plane to the ellipsoid \(x^2+2y^2+3z^2=6\) at \((1,1,1)\).`,
  parts:[{k:'E',label:'tangent plane:',kind:'equation',ans:e=>e.x+2*e.y+3*e.z-6,sol:'x+2y+3z=6',xwide:true,placeholder:'ax + by + cz = d'}],
  solution:R`\(F=x^2+2y^2+3z^2\), \(\nabla F=\langle 2x,4y,6z\rangle=\langle 2,4,6\rangle\) at \((1,1,1)\). Plane: \(2(x-1)+4(y-1)+6(z-1)=0\), or \(x+2y+3z=6\).`}},

{id:'g-chain',topic:'grad',title:'The chain rule with a tree diagram',
 concept:{q:R`How does the multivariable chain rule work? Explain how you would set up \(\dfrac{dz}{dt}\) when \(z=f(x,y)\) and \(x\), \(y\) both depend on \(t\).`,
  rubric:['Draw a tree: z depends on x and y, and each of those depends on t.','Add one term per path from z down to t, each term the product of the derivatives along the path: dz/dt = f_x dx/dt + f_y dy/dt, with the partials evaluated at (x(t), y(t)).'],
  model:R`<p>Tree: \(z\) branches to \(x\) and \(y\), each of which branches to \(t\). Every path from \(z\) to \(t\) contributes the product of the derivatives along it, and you add the paths: \(\dfrac{dz}{dt}=f_x\dfrac{dx}{dt}+f_y\dfrac{dy}{dt}\). Evaluate the partials at the current point \((x(t),y(t))\). In vector form this is \(\nabla f\cdot\mathbf{r}'(t)\).</p>`},
 app:{source:'Practice',
  prompt:R`Let \(z=x^2y\) with \(x=2t+1\) and \(y=t^2\). Use the chain rule to find \(\dfrac{dz}{dt}\) at \(t=1\).`,
  parts:[{k:'v',label:R`\(\dfrac{dz}{dt}\Big|_{t=1}=\)`,kind:'number',ans:30,sol:'30'}],
  solution:R`At \(t=1\): \(x=3\), \(y=1\). \(z_x=2xy=6\), \(z_y=x^2=9\), \(\tfrac{dx}{dt}=2\), \(\tfrac{dy}{dt}=2t=2\). \(\dfrac{dz}{dt}=6\cdot2+9\cdot2=30\). Check by substituting first: \(z=(2t+1)^2t^2\), and \(z'=4(2t+1)t^2+2t(2t+1)^2=12+18=30\) at \(t=1\).`}},

{id:'g-implicit',topic:'grad',title:'Implicit partial derivatives',
 concept:{q:R`If \(F(x,y,z)=0\) defines \(z\) implicitly as a function of \(x\) and \(y\), how do you find \(\partial z/\partial x\)? Where does the formula come from?`,
  rubric:['∂z/∂x = -F_x / F_z (and ∂z/∂y = -F_y / F_z), valid where F_z is not 0.','It comes from differentiating F(x, y, z(x,y)) = 0 with respect to x by the chain rule, holding y constant: F_x + F_z ∂z/∂x = 0.'],
  model:R`<p>Differentiate \(F(x,y,z(x,y))=0\) with respect to \(x\), holding \(y\) fixed. The chain rule gives \(F_x+F_z\,\dfrac{\partial z}{\partial x}=0\), so \(\dfrac{\partial z}{\partial x}=-\dfrac{F_x}{F_z}\) wherever \(F_z\ne 0\). Likewise \(\dfrac{\partial z}{\partial y}=-\dfrac{F_y}{F_z}\). Watch the minus sign.</p>`},
 app:{source:'Practice',
  prompt:R`Find \(\dfrac{\partial z}{\partial x}\) if \(x^3+y^3+z^3+6xyz=1\).`,
  parts:[{k:'zx',label:R`\(\dfrac{\partial z}{\partial x}=\)`,kind:'expr',vars:['x','y','z'],ans:e=>-(e.x**2+2*e.y*e.z)/(e.z**2+2*e.x*e.y),sol:'-(x^2+2yz)/(z^2+2xy)'}],
  solution:R`\(F=x^3+y^3+z^3+6xyz-1\). \(F_x=3x^2+6yz\), \(F_z=3z^2+6xy\). \(\dfrac{\partial z}{\partial x}=-\dfrac{3x^2+6yz}{3z^2+6xy}=-\dfrac{x^2+2yz}{z^2+2xy}\).`}},
];
})();
