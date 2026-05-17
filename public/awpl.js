// AWPL separated JS - extracted from AWPL (all good).html
// Spinner helpers
function showSpinner(){const s=document.getElementById('spinner'); if(s){s.style.display='block'; s.setAttribute('aria-hidden','false');}}
function hideSpinner(){const s=document.getElementById('spinner'); if(s){s.style.display='none'; s.setAttribute('aria-hidden','true');}}

// Theme toggle (persistent)
(function(){
  try{
    const btn=document.getElementById('themeToggle');
    const saved=localStorage.getItem('awpl_theme')||'light';
    if(saved==='dark')document.documentElement.setAttribute('data-theme','dark');
    if(btn){btn.addEventListener('click',()=>{const cur=document.documentElement.getAttribute('data-theme')==='dark'?'light':'dark';document.documentElement.setAttribute('data-theme',cur);localStorage.setItem('awpl_theme',cur);showToast(cur==='dark'?'Dark mode on':'Light mode on');});}
  }catch(e){console.error(e);} 
})();

// --- Save List Modal ---
const saveModalId='saveListModal';
function openSaveModal(){
  try{
    const keys=Object.keys(cart).map(Number);
    if(!keys.length){showToast('Add products first!');return;}
    let m=document.getElementById(saveModalId);
    if(!m){m=document.createElement('div');m.id=saveModalId;m.className='modal-overlay';m.innerHTML=`<div class="modal"><div class="modal-top"><h2>💾 Save Current List</h2><button class="modal-close" onclick="closeSaveModal()">✕</button></div><p class="modal-sub">Give this list a name and save for later editing.</p><input id="saveListName" placeholder="Enter list name (e.g. Raj Order)" style="width:100%;padding:12px;border:1px solid var(--border);border-radius:10px;margin-bottom:12px;font-size:14px;"/><div style="display:flex;gap:10px;"><button class="share-action sa-copy" onclick="saveCurrentList()">Save</button><button class="share-action sa-wa" onclick="closeSaveModal()">Cancel</button></div></div>`;document.body.appendChild(m);m.addEventListener('click',e=>{if(e.target===m)closeSaveModal();});}
    document.getElementById(saveModalId).classList.add('open');
    const nameInp=document.getElementById('saveListName'); if(nameInp)nameInp.value='';
  }catch(e){console.error(e);showToast('Failed to open save modal');}
}
function closeSaveModal(){const m=document.getElementById(saveModalId);if(m)m.classList.remove('open');}

function _getSnapshot(){
  const keys=Object.keys(cart).map(Number);
  const items=keys.map(idx=>({idx, name:PRODUCTS[idx].name, dp:PRODUCTS[idx].dp, mrp:PRODUCTS[idx].mrp, sp:PRODUCTS[idx].sp, qty:cart[idx], category:PRODUCTS[idx].category}));
  const totals={
    totalDP:items.reduce((s,it)=>s+it.dp*it.qty,0),
    totalMRP:items.reduce((s,it)=>s+it.mrp*it.qty,0),
    totalSP:items.reduce((s,it)=>s+it.sp*it.qty,0),
    totalQty:items.reduce((s,it)=>s+it.qty,0),
    unique:items.length
  };
  return {items,totals};
}

function saveCurrentList(){
  try{
    const name=document.getElementById('saveListName').value.trim();
    if(!name){showToast('Please enter a name');return;}
    const snap=_getSnapshot();
    const list={id:'list_'+Date.now(),name,createdAt:new Date().toISOString(),items:snap.items,totals:snap.totals};
    const key='awpl_saved_lists';
    const existing=JSON.parse(localStorage.getItem(key)||'[]');
    existing.unshift(list);
    localStorage.setItem(key,JSON.stringify(existing));
    closeSaveModal();
    showToast('Saved: '+name);
  }catch(e){console.error(e);showToast('Save failed');}
}

// Allow external pages to request loading a saved list by id. Also support edit flow via temporary key.
function loadSavedListById(id){
  try{
    const key='awpl_saved_lists';
    const lists=JSON.parse(localStorage.getItem(key)||'[]');
    const list=lists.find(l=>l.id===id);
    if(!list){showToast('Saved list not found');return;}
    cart={};
    list.items.forEach(it=>{cart[it.idx]=it.qty;});
    renderAll();
    showToast('Loaded: '+list.name);
  }catch(e){console.error(e);showToast('Failed to load list');}
}

// On page load, check if another page set an edit flag
try{
  const editKey=localStorage.getItem('awpl_edit_load');
  if(editKey){localStorage.removeItem('awpl_edit_load');setTimeout(()=>loadSavedListById(editKey),300);} 
}catch(e){/* ignore */}

// --- Embedded product data moved from original HTML ---
const PRODUCTS=[{"category":"WELLNESS PRODUCT","name":"EXE PANCH TULSI OIL","mrp":404,"dp":349,"sp":2,"qty":"25.00","unit":"ML","image":"https://awpl-kycdocs.s3.ap-south-1.amazonaws.com/upload1/product/_T331_092352.jpg","url":"https://www.asclepiuswellness.com/product/wellness-product/exe-panch-tulsi-oil/"},{"category":"WELLNESS PRODUCT","name":"ADIDOC PRAVAHI KWATH","mrp":444,"dp":383,"sp":2,"qty":"25.00","unit":"ML","image":"https://awpl-kycdocs.s3.ap-south-1.amazonaws.com/upload1/product/_T551_212707.jpg","url":"https://www.asclepiuswellness.com/product/wellness-product/adidoc-pravahi-kwath/"},{"category":"WELLNESS PRODUCT","name":"EXE TRIPHALA PRAVAHI KWATH","mrp":448,"dp":387,"sp":2,"qty":"500.00","unit":"ML","image":"https://awpl-kycdocs.s3.ap-south-1.amazonaws.com/upload1/product/_T531_152572.jpg","url":"https://www.asclepiuswellness.com/product/wellness-product/exe-triphala-pravahi-kwath/"},{"category":"WELLNESS PRODUCT","name":"PRODOC POWDER","mrp":713,"dp":568,"sp":3,"qty":"200.00","unit":"GM","image":"https://awpl-kycdocs.s3.ap-south-1.amazonaws.com/upload1/product/_T301_750199.jpg","url":"https://www.asclepiuswellness.com/product/wellness-product/prodoc-powder/"},{"category":"WELLNESS PRODUCT","name":"KIDGDOC RAS","mrp":794,"dp":685,"sp":4,"qty":"250.00","unit":"ML","image":"https://awpl-kycdocs.s3.ap-south-1.amazonaws.com/upload1/product/_T251_483331.jpg","url":"https://www.asclepiuswellness.com/product/wellness-product/kidgdoc-ras/"},{"category":"WELLNESS PRODUCT","name":"EXE ALOEVERA SYRUP","mrp":949,"dp":819,"sp":5,"qty":"1000.00","unit":"ML","image":"https://awpl-kycdocs.s3.ap-south-1.amazonaws.com/upload1/product/_T491_175017.jpg","url":"https://www.asclepiuswellness.com/product/wellness-product/exe-aloevera-syrup/"},{"category":"WELLNESS PRODUCT","name":"ALRGYDOC PRAVAHI KWATH","mrp":1255,"dp":1083,"sp":7,"qty":"500.00","unit":"ML","image":"https://awpl-kycdocs.s3.ap-south-1.amazonaws.com/upload1/product/_T581_456230.jpg","url":"https://www.asclepiuswellness.com/product/wellness-product/alrgydoc-pravahi-kwath/"},{"category":"WELLNESS PRODUCT","name":"EYEDOC DROP","mrp":1305,"dp":1128,"sp":7,"qty":"45.00","unit":"ML","image":"https://awpl-kycdocs.s3.ap-south-1.amazonaws.com/upload1/product/_T1091_948682.jpg","url":"https://www.asclepiuswellness.com/product/wellness-product/eyedoc-drop/"},{"category":"WELLNESS PRODUCT","name":"BRAINDOC PRAVAHI KWATH","mrp":1330,"dp":1148,"sp":7,"qty":"500.00","unit":"ML","image":"https://awpl-kycdocs.s3.ap-south-1.amazonaws.com/upload1/product/_T521_774383.jpg","url":"https://www.asclepiuswellness.com/product/wellness-product/braindoc-pravahi-kwath/"},{"category":"WELLNESS PRODUCT","name":"GYNEDOC RAS","mrp":1442,"dp":1244,"sp":8,"qty":"500.00","unit":"ML","image":"https://awpl-kycdocs.s3.ap-south-1.amazonaws.com/upload1/product/_T461_287571.jpg","url":"https://www.asclepiuswellness.com/product/wellness-product/gynedoc-ras/"},{"category":"WELLNESS PRODUCT","name":"DIABODOC RAS","mrp":1460,"dp":1259,"sp":8,"qty":"1000.00","unit":"ML","image":"https://awpl-kycdocs.s3.ap-south-1.amazonaws.com/upload1/product/_T451_812400.jpg","url":"https://www.asclepiuswellness.com/product/wellness-product/diabodoc-ras/"},{"category":"WELLNESS PRODUCT","name":"LIVODOC RAS","mrp":1494,"dp":1289,"sp":8,"qty":"500.00","unit":"ML","image":"https://awpl-kycdocs.s3.ap-south-1.amazonaws.com/upload1/product/_T471_402158.jpg","url":"https://www.asclepiuswellness.com/product/wellness-product/livodoc-ras/"},{"category":"WELLNESS PRODUCT","name":"IMMUNODOC RAS","mrp":2073,"dp":1789,"sp":12,"qty":"1000.00","unit":"ML","image":"https://awpl-kycdocs.s3.ap-south-1.amazonaws.com/upload1/product/_T441_806924.jpg","url":"https://www.asclepiuswellness.com/product/wellness-product/immunodoc-ras/"},{"category":"WELLNESS PRODUCT","name":"THUNDERBLAST RAS","mrp":2248,"dp":1939,"sp":13,"qty":"500.00","unit":"ML","image":"https://awpl-kycdocs.s3.ap-south-1.amazonaws.com/upload1/product/_T411_741213.jpg","url":"https://www.asclepiuswellness.com/product/wellness-product/thunderblast-ras/"},{"category":"WELLNESS PRODUCT","name":"THYDOC PRAVAHI KWATH","mrp":2435,"dp":2101,"sp":13,"qty":"1000.00","unit":"ML","image":"https://awpl-kycdocs.s3.ap-south-1.amazonaws.com/upload1/product/_T381_285864.jpg","url":"https://www.asclepiuswellness.com/product/wellness-product/thydoc-pravahi-kwath/"},{"category":"WELLNESS PRODUCT","name":"CARDIODOC RAS","mrp":2253,"dp":1945,"sp":13,"qty":"1000.00","unit":"ML","image":"https://awpl-kycdocs.s3.ap-south-1.amazonaws.com/upload1/product/_T421_913989.jpg","url":"https://www.asclepiuswellness.com/product/wellness-product/cardiodoc-ras/"},{"category":"WELLNESS PRODUCT","name":"PILODOC RAS","mrp":2403,"dp":2074,"sp":13,"qty":"1000.00","unit":"ML","image":"https://awpl-kycdocs.s3.ap-south-1.amazonaws.com/upload1/product/_T371_837757.jpg","url":"https://www.asclepiuswellness.com/product/wellness-product/pilodoc-ras/"},{"category":"WELLNESS PRODUCT","name":"CHLORODOC PRAVAHI KWATH","mrp":2421,"dp":2089,"sp":13,"qty":"1000.00","unit":"ML","image":"https://awpl-kycdocs.s3.ap-south-1.amazonaws.com/upload1/product/_T391_556221.jpg","url":"https://www.asclepiuswellness.com/product/wellness-product/chlorodoc-pravahi-kwath/"},{"category":"WELLNESS PRODUCT","name":"ORTHODOC PRAVAHI KWATH","mrp":2250,"dp":1941,"sp":13,"qty":"1000.00","unit":"ML","image":"https://awpl-kycdocs.s3.ap-south-1.amazonaws.com/upload1/product/_T401_053973.jpg","url":"https://www.asclepiuswellness.com/product/wellness-product/orthodoc-pravahi-kwath/"},{"category":"WELLNESS PRODUCT","name":"STONDOC RAS","mrp":2507,"dp":2163,"sp":14,"qty":"1000.00","unit":"ML","image":"https://awpl-kycdocs.s3.ap-south-1.amazonaws.com/upload1/product/_T361_371339.jpg","url":"https://www.asclepiuswellness.com/product/wellness-product/stondoc-ras/"},{"category":"WELLNESS PRODUCT","name":"OBEODOC RAS","mrp":2541,"dp":2192,"sp":15,"qty":"1000.00","unit":"ML","image":"https://awpl-kycdocs.s3.ap-south-1.amazonaws.com/upload1/product/_T351_122116.jpg","url":"https://www.asclepiuswellness.com/product/wellness-product/obeodoc-ras/"},{"category":"WELLNESS PRODUCT","name":"EXE PUNARNAVA KWATH","mrp":1144,"dp":960,"sp":5,"qty":"500.00","unit":"ML","image":"https://awpl-kycdocs.s3.ap-south-1.amazonaws.com/upload1/product/_T2021_379136.jpg","url":"https://www.asclepiuswellness.com/product/wellness-product/exe-punarnava-kwath/"},{"category":"WELLNESS PRODUCT","name":"ASCLEPIUS CHYAWANPRASH-AVALEHA","mrp":498,"dp":365,"sp":1,"qty":"500.00","unit":"GM","image":"https://awpl-kycdocs.s3.ap-south-1.amazonaws.com/upload1/product/_T2041_215136.jpg","url":"https://www.asclepiuswellness.com/product/wellness-product/asclepius-chyawanprash-avaleha/"},{"category":"WELLNESS PRODUCT","name":"EXE HERBAL TEA","mrp":526,"dp":404,"sp":2,"qty":"100.00","unit":"GM","image":"https://awpl-kycdocs.s3.ap-south-1.amazonaws.com/upload1/product/_T2141_553134.jpg","url":"https://www.asclepiuswellness.com/product/wellness-product/exe-herbal-tea/"},{"category":"WELLNESS PRODUCT","name":"FEVODOC PRAVAHI KWATH","mrp":2477,"dp":1973,"sp":12,"qty":"1000.00","unit":"ML","image":"https://awpl-kycdocs.s3.ap-south-1.amazonaws.com/upload1/product/_T2161_898860.jpg","url":"https://www.asclepiuswellness.com/product/wellness-product/fevodoc-pravahi-kwath/"},{"category":"WELLNESS PRODUCT","name":"COUGHDOC PRAVAHI KWATH","mrp":543,"dp":433,"sp":2,"qty":"200.00","unit":"ML","image":"https://awpl-kycdocs.s3.ap-south-1.amazonaws.com/upload1/product/_T2171_476437.jpg","url":"https://www.asclepiuswellness.com/product/wellness-product/coughdoc-pravahi-kwath/"},{"category":"WELLNESS PRODUCT","name":"EXE JC OINT","mrp":475,"dp":366,"sp":2,"qty":"50.00","unit":"GM","image":"https://awpl-kycdocs.s3.ap-south-1.amazonaws.com/upload1/product/_T2181_659708.jpg","url":"https://www.asclepiuswellness.com/product/wellness-product/exe-jc-oint/"},{"category":"WELLNESS PRODUCT","name":"EXE VEINDOC OIL","mrp":287,"dp":221,"sp":1,"qty":"25.00","unit":"ML","image":"https://awpl-kycdocs.s3.ap-south-1.amazonaws.com/upload1/product/_T2191_884318.jpg","url":"https://www.asclepiuswellness.com/product/wellness-product/exe-veindoc-oil/"},{"category":"WELLNESS PRODUCT","name":"VIRALDOC PRAVAHI KWATH","mrp":779,"dp":599,"sp":3,"qty":"500.00","unit":"ML","image":"https://awpl-kycdocs.s3.ap-south-1.amazonaws.com/upload1/product/_T2231_196359.jpg","url":"https://www.asclepiuswellness.com/product/wellness-product/viraldoc-pravahi-kwath/"},{"category":"WELLNESS PRODUCT","name":"EXE HERBAL MEHANDI POWDER","mrp":558,"dp":429,"sp":2,"qty":"200.00","unit":"GM","image":"https://awpl-kycdocs.s3.ap-south-1.amazonaws.com/upload1/product/_T2251_270211.jpg","url":"https://www.asclepiuswellness.com/product/wellness-product/exe-herbal-mehandi-powder/"},{"category":"WELLNESS PRODUCT","name":"AYUSH KWATH POWDER","mrp":315,"dp":242,"sp":1,"qty":"100.00","unit":"GM","image":"https://awpl-kycdocs.s3.ap-south-1.amazonaws.com/upload1/product/_T2261_745095.jpg","url":"https://www.asclepiuswellness.com/product/wellness-product/ayush-kwath-powder/"},{"category":"WELLNESS PRODUCT","name":"PRASS DOC","mrp":1285,"dp":988,"sp":6,"qty":"500.00","unit":"GM","image":"https://awpl-kycdocs.s3.ap-south-1.amazonaws.com/upload1/product/_T2271_277279.jpg","url":"https://www.asclepiuswellness.com/product/wellness-product/prass-doc/"},{"category":"WELLNESS PRODUCT","name":"EXE WHEAT GRASS POWDER","mrp":696,"dp":535,"sp":3,"qty":"100.00","unit":"GM","image":"https://awpl-kycdocs.s3.ap-south-1.amazonaws.com/upload1/product/_T2281_179781.jpg","url":"https://www.asclepiuswellness.com/product/wellness-product/exe-wheat-grass-powder/"},{"category":"WELLNESS PRODUCT","name":"EXE C COMFORT OIL","mrp":125,"dp":96,"sp":0.5,"qty":"10.00","unit":"ML","image":"https://awpl-kycdocs.s3.ap-south-1.amazonaws.com/upload1/product/_T2311_718119.jpg","url":"https://www.asclepiuswellness.com/product/wellness-product/exe-c-comfort-oil/"},{"category":"WELLNESS PRODUCT","name":"SHUDDH SHILAJIT CAPSULE","mrp":1785,"dp":1422,"sp":8,"qty":"60.00","unit":"NUMBER","image":"https://awpl-kycdocs.s3.ap-south-1.amazonaws.com/upload1/product/_T2551_640465.jpg","url":"https://www.asclepiuswellness.com/product/wellness-product/shuddh-shilajit-capsule/"}];
const OFFICIAL_PRICE_SOURCE={checkedOn:'23 Apr 2026',url:'https://www.asclepiuswellness.com/product/dssearch.aspx'};
const EMBEDDED_PRODUCTS = PRODUCTS.slice();

async function tryLoadLive(){
  const candidates = [
    'products.json',
    'https://www.asclepiuswellness.com/awpl-products.json'
  ];
  for(const url of candidates){
    try{
      showSpinner();
      const resp = await fetch(url, {cache: 'no-store'});
      if(!resp.ok){ hideSpinner(); continue; }
      const data = await resp.json();
      if(!Array.isArray(data) || !data.length){ hideSpinner(); continue; }
      PRODUCTS.length = 0; PRODUCTS.push(...data);
      const newCats = [...new Set(PRODUCTS.map(p=>p.category))].sort();
      const catSel = document.getElementById('categoryFilter');
      if(catSel){
        catSel.innerHTML = '<option value="">-- Filter by Category --</option>';
        newCats.forEach(c=>{const o=document.createElement('option');o.value=c; o.textContent=c; catSel.appendChild(o);});
      }
      const galleryCategory = document.getElementById('galleryCategory');
      if(galleryCategory){
        galleryCategory.innerHTML = '<option value="">All categories</option>';
        newCats.forEach(c=>{const o=document.createElement('option');o.value=c; o.textContent=c; galleryCategory.appendChild(o);});
      }
      document.getElementById('productTotalLabel').textContent = PRODUCTS.length+' Products';
      renderProductGallery();
      renderAll();
      hideSpinner();
      showToast('Live product data loaded from: '+url);
      return;
    }catch(e){
      console.error('live load failed',e);
      hideSpinner();
    }
  }
  hideSpinner();
  showToast('Using embedded product data');
  renderProductGallery();
  renderAll();
}

// cart and UI logic (kept in JS file)
let cart={};
function addToCart(idx){try{cart[idx]=(cart[idx]||0)+1;document.getElementById('dropdown').style.display='none';document.getElementById('searchInput').value='';renderAll();}catch(e){console.error(e);showToast('Failed to add item');}}
function changeQty(idx,d){try{cart[idx]=(cart[idx]||0)+d;if(cart[idx]<=0)delete cart[idx];renderAll();}catch(e){console.error(e);showToast('Quantity update failed');}}
function removeItem(idx){try{delete cart[idx];renderAll();}catch(e){console.error(e);showToast('Remove failed');}}
function clearAll(){try{cart={};renderAll();}catch(e){console.error(e);showToast('Clear failed');}}
function inr(n){return'₹'+n.toLocaleString('en-IN');}

function renderAll(){
  try{
    const keys=Object.keys(cart).map(Number);
    const cartBody=document.getElementById('cartBody');
    const picCard=document.getElementById('productInfoCard');
    if(!keys.length){
      cartBody.innerHTML=`<div class="empty-state"><div class="empty-icon">📦</div><p>Search and add AWPL products from the left panel to calculate totals.</p></div>`;
      if(picCard) picCard.style.display='none';
      updateSummary(0,0,0,0,0);
      return;
    }
    let tMRP=0,tDP=0,tSP=0,tQty=0;
    const rows=keys.map(idx=>{
      const p=PRODUCTS[idx],q=cart[idx];
      tMRP+=p.mrp*q;tDP+=p.dp*q;tSP+=p.sp*q;tQty+=q;
      return`<tr>
        <td data-label="Product"><div class="prod-name-main">${p.name}</div><span class="cat-badge">${p.category}</span></td>
        <td data-label="Unit Price" class="price-col">MRP: ${inr(p.mrp)}<br>DP: <b>${inr(p.dp)}</b><br>SP: <span style="color:var(--gold);font-weight:700">${p.sp} sp</span></td>
        <td data-label="Qty"><div class="qty-ctrl"><button class="qty-btn" onclick="changeQty(${idx},-1)">−</button><span class="qty-val">${q}</span><button class="qty-btn" onclick="changeQty(${idx},1)">+</button></div></td>
        <td data-label="Total"><div class="dp-total">${inr(p.dp*q)}</div><div class="mrp-total">${inr(p.mrp*q)}</div></td>
        <td data-label="SP" class="sp-val">${(p.sp*q).toFixed(2)} sp</td>
        <td data-label="Remove"><button class="remove-btn" onclick="removeItem(${idx})">✕</button></td>
      </tr>`;
    }).join('');
    cartBody.innerHTML=`<table class="cart-table"><thead><tr><th>Product</th><th>Unit Price</th><th>Qty</th><th>Total</th><th>SP</th><th></th></tr></thead><tbody>${rows}</tbody></table>`;
    if(picCard) picCard.style.display='flex';
    updateSummary(tMRP,tDP,tSP,tQty,keys.length);
  }catch(e){console.error(e);showToast('Failed to render cart');}
}

function updateSummary(mrp,dp,sp,qty,prods){
  document.getElementById('totalMRP').textContent=inr(mrp);
  document.getElementById('totalDP').textContent=inr(dp);
  document.getElementById('totalSP').textContent=sp.toFixed(2);
  document.getElementById('totalItems').textContent=qty;
  document.getElementById('uniqueProducts').textContent=prods+' product'+(prods===1?'':'s');
  const save=mrp-dp;
  document.getElementById('totalSaving').textContent=inr(save);
  const pct=mrp>0?((save/mrp)*100).toFixed(1):0;
  document.getElementById('savingPct').textContent=pct+'% off MRP';
  document.getElementById('shareCount').textContent=qty;
  document.getElementById('itemCountBadge').textContent=qty+' item'+(qty===1?'':'s');
  // update product card
  document.getElementById('picItems').textContent=qty;
  document.getElementById('picDP').textContent=inr(dp);
  document.getElementById('picSP').textContent=sp.toFixed(2)+' SP';
  document.getElementById('picSave').textContent=inr(save);
}

function renderProductGallery(){
  const q=(document.getElementById('gallerySearch')?.value||'').trim().toLowerCase();
  const cat=(document.getElementById('galleryCategory')?.value||'');
  const matches=PRODUCTS.filter(p=>
    (!cat||p.category===cat)&&
    (!q||`${p.name} ${p.category} ${p.qty||''} ${p.unit||''}`.toLowerCase().includes(q))
  );
  document.getElementById('galleryCount').textContent=matches.length+' product'+(matches.length===1?'':'s');
  if(!matches.length){
    document.getElementById('productGallery').innerHTML='<div class="gallery-empty">No product images match your search.</div>';
    return;
  }
  document.getElementById('productGallery').innerHTML=matches.map(p=>`
    <a class="gallery-item" href="${p.url}" target="_blank" rel="noopener noreferrer" title="Open official product page">
      <div class="gallery-img-wrap">
        <img src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.closest('.gallery-item').style.display='none'">
      </div>
      <div class="gallery-info">
        <div class="gallery-name">${p.name}</div>
        <div class="gallery-meta"><span>${p.category}</span><span class="gallery-price">${inr(p.dp)}</span></div>
      </div>
    </a>
  `).join('');
}

document.addEventListener('click',e=>{if(!e.target.closest('.search-wrap')&&!e.target.closest('#categoryFilter'))document.getElementById('dropdown').style.display='none';});

document.getElementById('gallerySearch')?.addEventListener('input',renderProductGallery);
document.getElementById('galleryCategory')?.addEventListener('change',renderProductGallery);

function buildShareText(){
  const keys=Object.keys(cart).map(Number);
  if(!keys.length)return'No products selected.';

  let tMRP=0,tDP=0,tSP=0,tQty=0;
  const lines=[];
  keys.forEach((idx,i)=>{
    const p=PRODUCTS[idx],q=cart[idx];
    const lineDP=p.dp*q,lineMRP=p.mrp*q,lineSP=p.sp*q;
    tMRP+=lineMRP;tDP+=lineDP;tSP+=lineSP;tQty+=q;
    lines.push(
`${i+1}. *${p.name}*
   Qty: ${q} | DP: Rs. ${p.dp.toLocaleString('en-IN')} | SP: ${p.sp.toFixed(2)}
   Total: Rs. ${lineDP.toLocaleString('en-IN')} | MRP: Rs. ${lineMRP.toLocaleString('en-IN')}`
    );
  });

  const date=new Date().toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'});
  const save=tMRP-tDP;
  const pct=tMRP>0?((save/tMRP)*100).toFixed(1):0;

  return(
`*AWPL Order Summary*
Date: ${date}

*Products*
${lines.join('\n\n')}

*Bill Summary*
Total Qty: ${tQty}
Total MRP: Rs. ${tMRP.toLocaleString('en-IN')}
Total DP: Rs. ${tDP.toLocaleString('en-IN')}
Savings: Rs. ${save.toLocaleString('en-IN')} (${pct}%)
Total SP: ${tSP.toFixed(2)}

Official price check:
https://www.asclepiuswellness.com/product/dssearch.aspx`
  );
}

function openShare(){
  const keys=Object.keys(cart).map(Number);
  if(!keys.length){showToast('Add products first!');return;}
  document.getElementById('sharePreview').textContent=buildShareText();
  document.getElementById('shareModal').classList.add('open');
}
function closeShare(){document.getElementById('shareModal').classList.remove('open');}
document.getElementById('shareModal')?.addEventListener('click',e=>{if(e.target===e.currentTarget)closeShare();});
function copyText(){navigator.clipboard.writeText(buildShareText()).then(()=>{closeShare();showToast('✅ Copied to clipboard!');});}
function shareWA(){window.open('https://wa.me/?text='+encodeURIComponent(buildShareText()),'_blank');}

function downloadPDF(){
  const keys=Object.keys(cart).map(Number);
  let tMRP=0,tDP=0,tSP=0,tQty=0;
  const rows=[];
  keys.forEach((idx,i)=>{
    const p=PRODUCTS[idx],q=cart[idx];
    tMRP+=p.mrp*q;tDP+=p.dp*q;tSP+=p.sp*q;tQty+=q;
    rows.push({sn:i+1,name:p.name,dp:'₹'+p.dp,sp:(p.sp).toFixed(2)+' sp',qty:q});
  });
  const date=new Date().toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'});
  const save=tMRP-tDP;
  
  let html=`
    <div style="font-family:'Poppins',Arial,sans-serif;padding:20px;background:white;">
      <h2 style="text-align:center;color:#1a7a3c;margin-bottom:5px;">📋 Products Order Summary</h2>
      <p style="text-align:center;color:#6b8c75;font-size:12px;margin-bottom:20px;">📅 ${date}</p>
      <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
        <thead>
          <tr>
            <th style="background:#1a7a3c;color:white;padding:10px;text-align:center;font-size:11px;">SN</th>
            <th style="background:#229147;color:white;padding:10px;text-align:left;font-size:11px;">Product Name</th>
            <th style="background:#4caf7d;color:white;padding:10px;text-align:center;font-size:11px;">DP (₹)</th>
            <th style="background:#d4a017;color:white;padding:10px;text-align:center;font-size:11px;">SP</th>
            <th style="background:#145e2d;color:white;padding:10px;text-align:center;font-size:11px;">Qty</th>
          </tr>
        </thead>
        <tbody>
  `;
  
  rows.forEach(r=>{
    html+=`
      <tr>
        <td style="background:#e8f5ed;color:#1a2e22;padding:8px;text-align:center;font-weight:bold;border-bottom:1px solid #d0e6d8;">${r.sn}</td>
        <td style="background:#f0faf5;color:#1a2e22;padding:8px;border-bottom:1px solid #d0e6d8;font-size:15px;">${r.name}</td>
        <td style="background:#d4f1e4;color:#145e2d;padding:8px;text-align:center;border-bottom:1px solid #d0e6d8;">${r.dp}</td>
        <td style="background:#fff9e6;color:#b8860b;padding:8px;text-align:center;border-bottom:1px solid #d0e6d8;">${r.sp}</td>
        <td style="background:#c8e6d8;color:#0d5e1f;padding:8px;text-align:center;border-bottom:1px solid #d0e6d8;">${r.qty}</td>
      </tr>
    `;
  });
  
  html+=`
        </tbody>
      </table>
      <div style="border-top:2px solid #1a7a3c;padding-top:15px;">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:10px;">
          <div><span style="color:#6b8c75;font-size:12px;">Total DP:</span></div>
          <div style="text-align:right;font-weight:bold;color:#145e2d;font-size:13px;">₹${tDP.toLocaleString('en-IN')}</div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:10px;">
          <div><span style="color:#6b8c75;font-size:12px;">Total SP:</span></div>
          <div style="text-align:right;font-weight:bold;color:#d4a017;font-size:13px;">${tSP.toFixed(2)} sp</div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
          <div><span style="color:#6b8c75;font-size:12px;">Price Check Visit:</span></div>
          <div style="text-align:right;font-size:11px;color:#1a7a3c;">🌐 https://www.asclepiuswellness.com/index.aspx</div>
        </div>
      </div>
    </div>
  `;
  
  const element=document.createElement('div');
  element.innerHTML=html;
  
  const opt={
    margin:10,
    filename:'AWPL-Order-Summary.pdf',
    image:{type:'jpeg',quality:0.98},
    html2canvas:{scale:2},
    jsPDF:{orientation:'portrait',unit:'mm',format:'a4'}
  };
  
  html2pdf().set(opt).from(element).save();
  closeShare();
  showToast('📄 PDF downloaded successfully!');
}

function showToast(msg){const t=document.getElementById('toast');if(!t)return; t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2800);} 

// Initialize listeners that depend on DOM
document.addEventListener('DOMContentLoaded',()=>{
  try{
    // Wire search inputs that were originally wired inline
    const inp=document.getElementById('searchInput');
    const catSel=document.getElementById('categoryFilter');
    const dropdown=document.getElementById('dropdown');
    if(inp) inp.addEventListener('input',()=>{const q=inp.value.trim().toLowerCase(); if(!q&&!catSel?.value){dropdown.style.display='none';return;} /* lightweight */});

    // Try load live data
    tryLoadLive();
  }catch(e){console.error(e);}  
});
