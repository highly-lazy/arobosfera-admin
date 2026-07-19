import { CheckCircle2, FileText, GripVertical, Loader2, Save, Shuffle, UploadCloud, WandSparkles } from 'lucide-react';
import mammoth from 'mammoth';
import { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { createQuestion, LEVELS } from '../lib/api';
import type { ParsedQuestion } from '../types';

const TYPE_IDS = [1, 2, 3, 4];
const CATEGORY_IDS = [1, 2, 3, 4, 5, 6, 7];
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const demo=`Arab tili zamonaviy dunyoda muhim xalqaro tillardan biridir. U yigirmadan ortiq davlatda rasmiy til hisoblanadi. Tilni muntazam o‘rganish insonning madaniy dunyoqarashini kengaytiradi.

1. Matnning asosiy g‘oyasi nima?
A) Sayohat qilish
B) Arab tilining ahamiyati
C) Sport bilan shug‘ullanish
D) Tarixiy sanalar
Javob: B

2. Arab tili nechta davlatda rasmiy til?
A) O‘ndan ortiq
B) Faqat beshta
C) Yigirmadan ortiq
D) Bitta
Javob: C`;

function parseText(raw:string){
  const lines=raw.split(/\r?\n/).map(x=>x.trim()).filter(Boolean); const questions:ParsedQuestion[]=[]; let current:ParsedQuestion|null=null; let passage:string[]=[];
  for(const line of lines){const qm=line.match(/^(\d+)[.)]\s*(.+)/);const om=line.match(/^([A-D])[.)]\s*(.+)/i);const am=line.match(/^(?:Javob|To['’]?g['’]?ri javob)\s*[:\-]\s*([A-D])/i);
    if(qm){if(current)questions.push(current);current={id:crypto.randomUUID(),text:qm[2],options:[],correctIndex:0};}
    else if(om&&current)current.options.push(om[2]);
    else if(am&&current)current.correctIndex=am[1].toUpperCase().charCodeAt(0)-65;
    else if(!current)passage.push(line);
  }
  if(current)questions.push(current);
  return {passage:passage.join('\n\n'),questions};
}

export function DocxParserPage(){
  const [raw,setRaw]=useState(demo); const [{passage,questions},setParsed]=useState(()=>parseText(demo)); const [busy,setBusy]=useState(false);
  // Saqlash sozlamalari — barcha ajratilgan savollarga bir xil qo'llanadi
  const [cfg,setCfg]=useState({languageLevelId:1,questionTypeId:1,categoryId:1,points:1});
  const [saving,setSaving]=useState(false); const [progress,setProgress]=useState(0);

  const readFile=async(file:File)=>{if(!file.name.endsWith('.docx'))return toast.error('Faqat .docx fayl yuklang');setBusy(true);try{const result=await mammoth.extractRawText({arrayBuffer:await file.arrayBuffer()});setRaw(result.value);setParsed(parseText(result.value));toast.success('DOCX muvaffaqiyatli tahlil qilindi')}catch{toast.error('Faylni o‘qib bo‘lmadi')}finally{setBusy(false)}};
  const shuffle=()=>setParsed({passage,questions:[...questions].sort(()=>Math.random()-.5).map(q=>({...q,options:[...q.options].sort(()=>Math.random()-.5)}))});

  // Ajratilgan savollarni haqiqiy test bankiga (/question/create) yozamiz.
  const saveAll=async()=>{
    const valid=questions.filter(q=>q.text.trim()&&q.options.filter(o=>o.trim()).length>=2);
    if(!valid.length)return toast.error('Saqlash uchun to‘liq savol topilmadi');
    setSaving(true);setProgress(0);
    let ok=0,fail=0;
    for(const q of valid){
      const opts=q.options.filter(o=>o.trim());
      try{
        await createQuestion({
          questionTypeId:cfg.questionTypeId,categoryId:cfg.categoryId,languageLevelId:cfg.languageLevelId,
          text:q.text,readingPassage:passage||null,points:cfg.points,
          options:opts.map((o,i)=>({optionText:o,isCorrect:i===q.correctIndex,orderIndex:i})),
        });
        ok++;
      }catch{fail++;}
      setProgress(ok+fail);
      await sleep(350); // Render tez ketma-ket yozishda so'rovni tushirmasligi uchun
    }
    setSaving(false);
    if(fail)toast.error(`${ok} ta saqlandi, ${fail} tasida xatolik`);
    else toast.success(`${ok} ta savol test bankiga saqlandi`);
  };

  return <div className="grid gap-6 xl:grid-cols-[.85fr_1.15fr]"><div className="space-y-5"><Card><div className="rounded-3xl border-2 border-dashed border-[#3a4653] bg-[#111820] p-8 text-center"><UploadCloud className="mx-auto text-[#58cc02]" size={40}/><h2 className="mt-4 text-lg font-black">Word hujjatini yuklang</h2><p className="mt-2 text-sm text-[#7f8c99]">Savollar, variantlar va to‘g‘ri javoblar avtomatik ajratiladi</p><label className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-[var(--accent)] px-5 py-3 font-black text-[#132008] shadow-[0_4px_0_var(--accent-dark)]"><FileText size={18}/>{busy?'Tahlil qilinmoqda...':'DOCX fayl tanlash'}<input type="file" accept=".docx" className="hidden" onChange={e=>e.target.files?.[0]&&readFile(e.target.files[0])}/></label></div></Card><Card><div className="mb-3 flex items-center justify-between"><div><h2 className="font-black">Xom matn</h2><p className="text-xs text-[#7f8c99]">Qo‘lda tahrirlash ham mumkin</p></div><WandSparkles className="text-[#ce82ff]"/></div><textarea value={raw} onChange={e=>setRaw(e.target.value)} className="custom-scrollbar h-[360px] w-full resize-none rounded-2xl border border-[#303a46] bg-[#0e141b] p-4 text-sm leading-6 outline-none focus:border-[#58cc02]"/><Button className="mt-3 w-full" onClick={()=>{setParsed(parseText(raw));toast.success('Matn qayta tahlil qilindi')}}><WandSparkles size={18}/>Qayta tahlil qilish</Button></Card></div><Card className="h-fit"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-black">Ajratilgan kontent</h2><p className="text-sm text-[#7f8c99]">{questions.length} ta savol topildi</p></div><div className="flex gap-2"><Button variant="secondary" onClick={shuffle}><Shuffle size={17}/>Aralashtirish</Button><Button disabled={saving} onClick={saveAll}>{saving?<Loader2 size={17} className="animate-spin"/>:<Save size={17}/>}{saving?`Saqlanmoqda ${progress}/${questions.length}`:'Bankka saqlash'}</Button></div></div>
    <div className="mt-4 grid gap-3 rounded-2xl border border-[#2f3a45] bg-[#10171f] p-4 sm:grid-cols-4">
      <label><span className="mb-1.5 block text-xs font-bold text-[#8d99a6]">Daraja</span><select value={cfg.languageLevelId} onChange={e=>setCfg({...cfg,languageLevelId:+e.target.value})} className="w-full rounded-xl border border-[#303a46] bg-[#111820] px-3 py-2.5 text-sm outline-none">{LEVELS.map((l,i)=><option key={l} value={i+1}>{l}</option>)}</select></label>
      <label><span className="mb-1.5 block text-xs font-bold text-[#8d99a6]">Savol turi</span><select value={cfg.questionTypeId} onChange={e=>setCfg({...cfg,questionTypeId:+e.target.value})} className="w-full rounded-xl border border-[#303a46] bg-[#111820] px-3 py-2.5 text-sm outline-none">{TYPE_IDS.map(t=><option key={t} value={t}>Tur {t}</option>)}</select></label>
      <label><span className="mb-1.5 block text-xs font-bold text-[#8d99a6]">Kategoriya</span><select value={cfg.categoryId} onChange={e=>setCfg({...cfg,categoryId:+e.target.value})} className="w-full rounded-xl border border-[#303a46] bg-[#111820] px-3 py-2.5 text-sm outline-none">{CATEGORY_IDS.map(c=><option key={c} value={c}>Kategoriya {c}</option>)}</select></label>
      <label><span className="mb-1.5 block text-xs font-bold text-[#8d99a6]">Har savol balli</span><input type="number" min={1} value={cfg.points} onChange={e=>setCfg({...cfg,points:+e.target.value||1})} className="w-full rounded-xl border border-[#303a46] bg-[#111820] px-3 py-2.5 text-sm outline-none"/></label>
    </div>
    {passage&&<div className="mt-5 rounded-2xl border border-[#2f3a45] bg-[#10171f] p-4"><div className="mb-2 flex items-center justify-between"><b>Reading matni</b><Badge tone="green">Aniqlandi</Badge></div><p className="whitespace-pre-line text-sm leading-7 text-[#b5c0cb]">{passage}</p></div>}<div className="mt-5 space-y-4">{questions.map((q,index)=><div key={q.id} className="rounded-2xl border border-[#2b3541] bg-[#111820] p-4"><div className="flex gap-3"><GripVertical className="mt-1 shrink-0 text-[#596675]"/><div className="flex-1"><div className="flex items-start justify-between gap-3"><p className="font-extrabold">{index+1}. {q.text}</p><Badge tone="blue">Savol</Badge></div><div className="mt-3 grid gap-2 sm:grid-cols-2">{q.options.map((o,i)=><div key={i} className={`flex items-center gap-2 rounded-xl border p-3 text-sm ${i===q.correctIndex?'border-[#58cc02]/40 bg-[#58cc02]/10 text-[#8de760]':'border-[#2b3541] bg-[#151d26] text-[#abb6c1]'}`}><span className="grid h-6 w-6 place-items-center rounded-lg bg-[#25303b] text-xs font-black">{String.fromCharCode(65+i)}</span>{o}{i===q.correctIndex&&<CheckCircle2 className="ml-auto" size={17}/>}</div>)}</div></div></div></div>)}</div></Card></div>;
}
