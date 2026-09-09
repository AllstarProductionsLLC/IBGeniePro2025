// Paste into the Wix page containing the website embed #ibGenieApp.
// Set that embed's website address to exactly IBGENIE_APP_ORIGIN.
import {authentication as siteAuthentication} from "@wix/site";
import {authentication} from "wix-members-frontend";
import {getIbGenieAssertion} from "backend/ibgenie.web";
$w.onReady(()=>{let busy=false;$w("#ibGenieApp").onMessage(async event=>{const data=event.data;if(!data||!["IBGENIE_AUTH_REQUEST","IBGENIE_SIGN_IN_REQUEST"].includes(data.type)||data.version!==1||typeof data.nonce!=="string"||!/^[a-f0-9]{48}$/.test(data.nonce)||busy)return;busy=true;const reply=(type,extra={})=>$w("#ibGenieApp").postMessage({type,nonce:data.nonce,...extra});try{if(!siteAuthentication.loggedIn()&&data.type==="IBGENIE_SIGN_IN_REQUEST"){try{await authentication.promptLogin();}catch{}}if(!siteAuthentication.loggedIn()){reply("IBGENIE_AUTH_REQUIRED");return;}const result=await getIbGenieAssertion(data.nonce);reply("IBGENIE_AUTH_ASSERTION",{assertion:result.assertion});}catch{reply("IBGENIE_AUTH_ERROR");}finally{busy=false;}});});
