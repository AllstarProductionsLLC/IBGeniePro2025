// Install as Wix Backend/ibgenie.web.js. Never place this in public/page code.
import {Permissions,webMethod} from "wix-web-module";
import {currentMember} from "wix-members-backend";
import {orders} from "wix-pricing-plans-backend";
import {secrets} from "wix-secrets-backend.v2";
import {elevate} from "wix-auth";
import {paidPlans,makeAssertion} from "backend/ibgenie-policy";
const readSecret=elevate(secrets.getSecretValue);
const ISSUER="https://www.ibgenie.com";
export const getIbGenieAssertion=webMethod(Permissions.SiteMember,async nonce=>{
 if(typeof nonce!=="string"||!/^[a-f0-9]{48}$/.test(nonce))throw new Error("Invalid connection request.");
 try{const member=await currentMember.getMember();if(!member?._id)throw new Error("Sign in first.");const allOrders=[];
 for(let skip=0;;skip+=100){if(skip>=1000)throw new Error("Order review required.");
 // Keep member permissions: no elevation, browser member IDs or client Pro claims.
 const page=await orders.listCurrentMemberOrders({},{},{limit:100,skip});if(!Array.isArray(page))throw new Error("Order lookup unavailable.");allOrders.push(...page);if(page.length<100)break;}
 const[bridge,app]=await Promise.all([readSecret("IBGENIE_BRIDGE_SECRET"),readSecret("IBGENIE_APP_ORIGIN")]);
 return{assertion:makeAssertion({memberId:member._id,plans:paidPlans(allOrders,member._id),nonce,secret:bridge.value,appOrigin:app.value,issuer:ISSUER})};
 }catch{throw new Error("Wix could not confirm your membership. Please try again shortly.");}
});
