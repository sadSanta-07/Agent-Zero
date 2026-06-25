/**
 * Automatically generates a Google Document formatted as an Executive Briefing
 * and attaches it to the user's Google Drive.
 */
export async function generatePrepDoc(
  accessToken: string, 
  eventTitle: string, 
  agendaText: string
): Promise<string | null> {
  try {
    const createRes = await fetch("https://docs.googleapis.com/v1/documents", {
      method: "POST",
      headers: { 
        Authorization: `Bearer ${accessToken}`, 
        "Content-Type": "application/json" 
      },
      body: JSON.stringify({ 
        title: `[Executive Brief] - ${eventTitle}` 
      })
    });
    
    if (!createRes.ok) throw new Error(`Failed to create document (Status: ${createRes.status})`);
    
    const docData = await createRes.json();
    const documentId = docData.documentId;

    const structuredDossier = `========================================================
AUTOMATED EXECUTIVE BRIEF: ${eventTitle.toUpperCase()}
PREPARED BY: System Automation Node
STATUS: ACTIVE WORKFLOW
========================================================

[ 1. CONTEXT & OBJECTIVE ]
${agendaText || "Strategic alignment on project deliverables and timeline optimization."}

[ 2. DISCUSSION POINTS ]
☐ Review current operational blockers and bottlenecks.
☐ Establish clear timelines for remaining milestones.
☐ Identify dependencies from external stakeholders.
☐ Confirm QA and deployment procedures.

[ 3. REQUIRED OUTCOMES ]
1. Documented assignment of action items and owners.
2. Confirmation on final delivery dates.
3. Identification of primary bottlenecks for the current cycle.

[ 4. POST-MEETING PROTOCOL ]
- Update the system entity matrix with new constraints.
- Dispatch automated follow-up communications to all attendees summarizing agreed-upon action items.

========================================================
SYSTEM NOTE: Immediate action required on highlighted blockers to prevent timeline decay. Maintain rigorous documentation of all verbal commitments.
========================================================`;

    const updateRes = await fetch(`https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`, {
      method: "POST",
      headers: { 
        Authorization: `Bearer ${accessToken}`, 
        "Content-Type": "application/json" 
      },
      body: JSON.stringify({
        requests: [{
          insertText: {
            location: { index: 1 },
            text: structuredDossier
          }
        }]
      })
    });

    if (!updateRes.ok) throw new Error(`Failed to inject document content (Status: ${updateRes.status})`);

    return `https://docs.google.com/document/d/${documentId}/edit`;
    
  } catch (error) {
    console.error("Docs Generation Error:", error);
    return null;
  }
}