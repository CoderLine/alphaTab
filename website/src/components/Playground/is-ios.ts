const iOSPlatforms = new Set(['iPhone', 'iPad', 'iPod']);
/** iOS file pickers grey out files whose type they do not know, so `accept` filters must be skipped there. */
export function isIOS() {
  // Tested: 
  // - iPad Pro 12.9 - iOS 12 (navigator.platform = "iPad")
  // - iPad Pro 11 2020 - iOS 13 (navigator.platform = "iPad")
  // - iPad Air 4 - iOS 14 (navigator.platform = "iPad")
  // - iPad Mini 2021 - iOS 15 (navigator.platform = "iPad")
  // - iPad Pro 12.9 2022 - iOS 16 (navigator.platform = "iPad")
  // - iPad Pro 12.9 2021 - iOS 17 (navigator.platform = "MacIntel" && navigator.maxTouchPoints > 1)
  // - iPad 9th - iOS 18 (navigator.platform = "iPad")
  // - iPhone XS - iOS 12 (navigator.platform = "iPhone")
  // - iPhone 11 - iOS 13 (navigator.platform = "iPhone")
  // - iPhone 12 - iOS 14 (navigator.platform = "iPhone")
  // - iPhone 13 - iOS 15 (navigator.platform = "iPhone")
  // - iPhone 14 - iOS 16 (navigator.platform = "iPhone")
  // - iPhone 15 - iOS 17 (navigator.platform = "iPhone")
  // - iPhone 16 - iOS 18 (navigator.platform = "iPhone")
  // - iPhone 16 - iOS 18.6 (navigator.platform = "iPhone")
  return iOSPlatforms.has(navigator.platform) ||
    navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
}
