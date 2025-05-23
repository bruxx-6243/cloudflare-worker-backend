export const emailLayout = (content: string) => `
  <div style="width: 100%; background-color: #f5f5f5; padding: 30px 0; font-family: Arial, sans-serif;">
    <div style="max-width: 450px; margin: 0 auto; background-color: #ffffff; border-top: 4px solid #1E90FF; border-bottom: 4px solid #ffd016; border-radius: 6px; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1); padding: 24px;">
      ${content}
      <p style="font-size: 13px; color: #333; margin: 0;">
      Fariol Blondeau,<br><strong style="color: #555;">Bruxx Dev</strong>
    </p>
    </div>
  </div>
`;
