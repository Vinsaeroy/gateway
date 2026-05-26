export const resolveToJid = async (riz, input) => {
  if (!input) return null

  if (typeof input === "object") {
    const maybe =
      input.participant ||
      input.sender ||
      input.key?.participant ||
      input.key?.remoteJid

    if (maybe) input = maybe
    else return null
  }

  input = String(input)

  // LID -> PN
  try {
    if (input.includes("@lid") || /^[a-z0-9_-]{10,}@lid$/.test(input)) {
      const mapped = await riz?.lidMappingStore?.getPNForLID?.(input)
      if (mapped) return mapped
    }
  } catch (e) {
  }
  
  if (input.includes("@")) return input

  let digits = input.replace(/\D/g, "")
  if (!digits) return null

  if (digits.startsWith("0")) digits = "62" + digits.slice(1)
  else if (digits.startsWith("8")) digits = "62" + digits

  return `${digits}@s.whatsapp.net`
}