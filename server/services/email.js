const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendOverdueEmail = async (to, tasks) => {
  const taskList = tasks
    .map((t) => `
      <tr>
        <td style="padding:10px 14px;border-bottom:1px solid #1E293B;color:#F1F5F9;font-size:13px">${t.title}</td>
        <td style="padding:10px 14px;border-bottom:1px solid #1E293B;font-size:13px">
          <span style="background:rgba(248,113,113,0.15);color:#F87171;padding:2px 8px;border-radius:99px;font-size:11px">${t.priority}</span>
        </td>
        <td style="padding:10px 14px;border-bottom:1px solid #1E293B;color:#F87171;font-size:13px">
          ${new Date(t.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </td>
      </tr>
    `)
    .join("");

  const html = `
    <div style="background:#0A0A0F;padding:2rem;font-family:Inter,sans-serif;max-width:600px;margin:0 auto">
      <div style="margin-bottom:2rem">
        <span style="font-weight:700;font-size:18px;color:#818CF8">&#9889; TaskFlow</span>
      </div>
      <div style="background:#13131F;border:1px solid rgba(248,113,113,0.3);border-radius:12px;padding:1.5rem;margin-bottom:1.5rem">
        <h2 style="color:#F87171;font-size:18px;margin:0 0 8px">&#9888; Overdue Tasks Alert</h2>
        <p style="color:#64748B;font-size:13px;margin:0">The following tasks have passed their due date.</p>
      </div>
      <table style="width:100%;border-collapse:collapse;background:#13131F;border-radius:12px;overflow:hidden;border:1px solid rgba(255,255,255,0.07)">
        <thead>
          <tr style="background:#0F0F1A">
            <th style="padding:10px 14px;text-align:left;color:#64748B;font-size:11px">TASK</th>
            <th style="padding:10px 14px;text-align:left;color:#64748B;font-size:11px">PRIORITY</th>
            <th style="padding:10px 14px;text-align:left;color:#64748B;font-size:11px">DUE DATE</th>
          </tr>
        </thead>
        <tbody>${taskList}</tbody>
      </table>
      <p style="color:#334155;font-size:12px;text-align:center;margin-top:2rem">
        Automated notification from TaskFlow.
      </p>
    </div>
  `;

  const { error } = await resend.emails.send({
    from: 'TaskFlow <onboarding@resend.dev>',
    to,
    subject: `You have ${tasks.length} overdue task${tasks.length > 1 ? "s" : ""}`,
    html,
  });

  if (error) {
    console.error('Resend error:', error);
    throw new Error(error.message);
  }

  console.log(`Overdue email sent to ${to}`);
};

module.exports = { sendOverdueEmail };