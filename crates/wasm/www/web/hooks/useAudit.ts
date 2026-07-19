import { useState } from 'react';

export function useAudit() {
  const [auditReport, setAuditReport] = useState<string>("");
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [showAudit, setShowAudit] = useState<boolean>(false);

  const triggerAudit = async (text: string, scores: any, isMockMode: boolean, onCopy: () => void) => {
    if (isMockMode) {
      onCopy();
      alert('📋 已复制诊断包，请粘贴到 Web Chat（如 ChatGPT、DeepSeek）获取解读');
      return;
    }
    if (!text || !scores) {
      alert('请先完成推演，且确保评分数据存在。');
      return;
    }
    setIsAuditing(true);
    setShowAudit(true);
    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, scores }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || '审计请求失败');
      }
      const data = await res.json();
      setAuditReport(data.report || '未生成审计报告');
    } catch (err: any) {
      alert('审计失败: ' + err.message);
      setShowAudit(false);
    } finally {
      setIsAuditing(false);
    }
  };

  return { auditReport, isAuditing, showAudit, triggerAudit, setAuditReport, setShowAudit };
}
