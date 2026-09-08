// Build-only compatibility for sandboxes without readable /proc memory counters.
const v8=require("node:v8");
try{process.memoryUsage();}catch(error){
if(error.syscall!=="uv_resident_set_memory")throw error;
const fallback=()=>{const h=v8.getHeapStatistics();return{rss:process.resourceUsage().maxRSS*1024,heapTotal:h.total_heap_size,heapUsed:h.used_heap_size,external:h.external_memory,arrayBuffers:0};};
fallback.rss=()=>process.resourceUsage().maxRSS*1024;
process.memoryUsage=fallback;
}
