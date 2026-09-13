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
