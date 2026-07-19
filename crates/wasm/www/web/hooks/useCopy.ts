export function useCopy() {
  const copyToClipboard = async (text: string, successMsg?: string) => {
    try {
      await navigator.clipboard.writeText(text);
      if (successMsg) alert(successMsg);
      return true;
    } catch (_) {
      alert('复制失败，请手动复制');
      return false;
    }
  };
  return { copyToClipboard };
}
