/** @jest-environment node */
import { validateFeedback, validateGrammar } from "./feedback-validation";
const work="The measured temperature increased by two degrees.";
const criteria=[{id:"evidence",label:"Evidence",max:8,descriptors:"Support a claim with relevant observations and measurements."}];
const report=()=>({overview:"A useful start",strengths:["Measurement recorded"],nextSteps:["Explain uncertainty"],comment:"Keep developing the explanation.",criteria:[{id:"evidence",score:5,evidence:"increased by two degrees",rationale:"One measurement supports the claim.",nextStep:"Repeat the measurement."}]});
it("accepts an evidence-linked mark within the supplied criterion range",()=>expect(validateFeedback(report(),work,criteria,true).criteria[0].score).toBe(5));
it("never returns a mark supported by a fabricated or absent quotation",()=>{const r=report();r.criteria[0].evidence="imaginary quotation";expect(validateFeedback(r,work,criteria,true).criteria[0]).toMatchObject({evidence:"",score:null});});
it("keeps formative-only and PYP feedback unscored",()=>expect(validateFeedback(report(),work,criteria,false).criteria[0].score).toBeNull());
it("rejects invented criteria and marks outside the supplied rubric",()=>{const r=report();r.criteria[0].score=9;expect(()=>validateFeedback(r,work,criteria,true)).toThrow("outside");r.criteria[0].score=5;r.criteria[0].id="invented";expect(()=>validateFeedback(r,work,criteria,true)).toThrow();});
it("rejects grammar edits that do not quote the submitted text",()=>{const r={summary:"Review agreement",suggestions:[{original:"They is",replacement:"They are",reason:"Plural subject",category:"Grammar"}],practice:"Write another sentence."};expect(()=>validateGrammar(r,work)).toThrow("did not match");expect(validateGrammar(r,"They is ready.").suggestions).toHaveLength(1);});
