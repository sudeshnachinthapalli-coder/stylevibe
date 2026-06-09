// Fashion Color Palette Database
const FASHION_COLORS = [
  { hex: "#0a0a0a", r: 10, g: 10, b: 10, name: "Charcoal Black", isDark: true, type: "neutral" },
  { hex: "#ffffff", r: 255, g: 255, b: 255, name: "Crisp White", isDark: false, type: "neutral" },
  { hex: "#faf9f6", r: 250, g: 249, b: 246, name: "Alabaster White", isDark: false, type: "neutral" },
  { hex: "#eae6df", r: 234, g: 230, b: 223, name: "Warm Cream", isDark: false, type: "neutral" },
  { hex: "#d2b48c", r: 210, g: 180, b: 140, name: "Desert Tan", isDark: false, type: "neutral" },
  { hex: "#8b5a2b", r: 139, g: 90, b: 43, name: "Cognac Brown", isDark: true, type: "neutral" },
  { hex: "#3d2314", r: 61, g: 35, b: 20, name: "Espresso Brown", isDark: true, type: "neutral" },
  { hex: "#708090", r: 112, g: 128, b: 144, name: "Slate Grey", isDark: true, type: "neutral" },
  { hex: "#d3d3d3", r: 211, g: 211, b: 211, name: "Heather Grey", isDark: false, type: "neutral" },
  { hex: "#4a6b82", r: 74, g: 107, b: 130, name: "Steel Blue", isDark: true, type: "cool" },
  { hex: "#0b3c5d", r: 11, g: 60, b: 93, name: "Midnight Navy", isDark: true, type: "cool" },
  { hex: "#1e3f20", r: 30, g: 63, b: 32, name: "Forest Green", isDark: true, type: "cool" },
  { hex: "#556b2f", r: 85, g: 107, b: 47, name: "Olive Green", isDark: true, type: "cool" },
  { hex: "#e2725b", r: 226, g: 114, b: 91, name: "Terracotta Rust", isDark: false, type: "warm" },
  { hex: "#800020", r: 128, g: 0, b: 32, name: "Deep Burgundy", isDark: true, type: "warm" },
  { hex: "#ffc0cb", r: 255, g: 192, b: 203, name: "Blush Pink", isDark: false, type: "warm" },
  { hex: "#ffd700", r: 255, g: 215, b: 0, name: "Mustard Gold", isDark: false, type: "warm" },
  { hex: "#7b2cbf", r: 123, g: 44, b: 191, name: "Royal Violet", isDark: true, type: "cool" },
  { hex: "#ff7f50", r: 255, g: 127, b: 80, name: "Coral Accent", isDark: false, type: "warm" },
  { hex: "#40e0d0", r: 64, g: 224, b: 208, name: "Turquoise Teal", isDark: false, type: "cool" },
  { hex: "#e63946", r: 230, g: 57, b: 70, name: "Crimson Red", isDark: true, type: "warm" },
  { hex: "#ffdd00", r: 255, g: 221, b: 0, name: "Neon Yellow", isDark: false, type: "bright" },
  { hex: "#39ff14", r: 57, g: 255, b: 20, name: "Neon Green", isDark: false, type: "bright" },
  { hex: "#ff007f", r: 255, g: 0, b: 127, name: "Neon Pink", isDark: false, type: "bright" }
];

// Helper to find the closest fashion color
export function getClosestFashionColor(r, g, b) {
  let minDistance = Infinity;
  let closest = FASHION_COLORS[0];
  
  for (const color of FASHION_COLORS) {
    const dist = Math.sqrt(
      Math.pow(r - color.r, 2) +
      Math.pow(g - color.g, 2) +
      Math.pow(b - color.b, 2)
    );
    if (dist < minDistance) {
      minDistance = dist;
      closest = color;
    }
  }
  return closest;
}

// Color extraction from Image Element or Data URI
export function extractDominantColors(imageSrc, callback) {
  const img = new Image();
  img.crossOrigin = "Anonymous";
  img.src = imageSrc;
  
  img.onload = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    
    // Scale down the image to speed up color scanning and group averages
    canvas.width = 50;
    canvas.height = 50;
    
    ctx.drawImage(img, 0, 0, 50, 50);
    
    try {
      const imageData = ctx.getImageData(0, 0, 50, 50);
      const data = imageData.data;
      const colorCounts = {};
      
      // Quantize colors (group pixels into grid segments)
      const quantFactor = 32; // group colors into bins of 32
      
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i+1];
        const b = data[i+2];
        const a = data[i+3];
        
        // Skip highly transparent pixels
        if (a < 128) continue;
        
        // Quantize colors to bin
        const qr = Math.round(r / quantFactor) * quantFactor;
        const qg = Math.round(g / quantFactor) * quantFactor;
        const qb = Math.round(b / quantFactor) * quantFactor;
        const hex = rgbToHex(qr, qg, qb);
        
        if (!colorCounts[hex]) {
          colorCounts[hex] = { r: qr, g: qg, b: qb, count: 0 };
        }
        colorCounts[hex].count++;
      }
      
      // Sort colors by abundance
      const sortedColors = Object.values(colorCounts).sort((a, b) => b.count - a.count);
      
      // Filter out colors that are too close to each other to ensure distinct palette output
      const distinctColors = [];
      const distanceThreshold = 60; // RGB distance threshold
      
      for (const col of sortedColors) {
        let isDistinct = true;
        for (const existing of distinctColors) {
          const dist = Math.sqrt(
            Math.pow(col.r - existing.r, 2) +
            Math.pow(col.g - existing.g, 2) +
            Math.pow(col.b - existing.b, 2)
          );
          if (dist < distanceThreshold) {
            isDistinct = false;
            break;
          }
        }
        if (isDistinct) {
          distinctColors.push(col);
        }
        if (distinctColors.length >= 4) break;
      }
      
      // Map back to our premium fashion database colors
      const finalPalette = distinctColors.map(col => {
        const mapped = getClosestFashionColor(col.r, col.g, col.b);
        return {
          hex: mapped.hex,
          name: mapped.name,
          isDark: mapped.isDark,
          type: mapped.type,
          originalHex: rgbToHex(col.r, col.g, col.b)
        };
      });
      
      callback(finalPalette);
    } catch (e) {
      console.error("Failed to read image data (canvas security context limit)", e);
      // Fallback palette on canvas error
      callback([
        { hex: "#0a0a0a", name: "Charcoal Black", isDark: true, type: "neutral" },
        { hex: "#faf9f6", name: "Alabaster White", isDark: false, type: "neutral" },
        { hex: "#d2b48c", name: "Desert Tan", isDark: false, type: "neutral" },
        { hex: "#0b3c5d", name: "Midnight Navy", isDark: true, type: "cool" }
      ]);
    }
  };
  
  img.onerror = () => {
    callback([
      { hex: "#0a0a0a", name: "Charcoal Black", isDark: true, type: "neutral" },
      { hex: "#faf9f6", name: "Alabaster White", isDark: false, type: "neutral" },
      { hex: "#d2b48c", name: "Desert Tan", isDark: false, type: "neutral" },
      { hex: "#0b3c5d", name: "Midnight Navy", isDark: true, type: "cool" }
    ]);
  };
}

function rgbToHex(r, g, b) {
  return "#" + [r, g, b].map(x => {
    const hex = Math.max(0, Math.min(255, x)).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  }).join("");
}

// Main Outfit Analyzer Logic
export function analyzeOutfit({ colors, occasion, vibe, notes }) {
  // 1. Identify characteristics of the color palette
  const hasNeutral = colors.some(c => c.type === "neutral");
  const hasCool = colors.some(c => c.type === "cool");
  const hasWarm = colors.some(c => c.type === "warm");
  const hasBright = colors.some(c => c.type === "bright");
  const darkCount = colors.filter(c => c.isDark).length;
  const lightCount = colors.length - darkCount;
  
  // Categorize palette harmony
  let harmonyType = "Neutral Base";
  let colorScoreFactor = 8.5;
  
  if (colors.every(c => c.type === "neutral")) {
    harmonyType = "Sleek Monochrome / Neutral Minimalism";
    colorScoreFactor = 9.0;
  } else if (hasNeutral && colors.filter(c => c.type !== "neutral").length === 1) {
    harmonyType = "Classic Anchor: Single Accent";
    colorScoreFactor = 9.2;
  } else if (hasWarm && hasCool && !hasNeutral) {
    harmonyType = "Vibrant Contrast Palette";
    colorScoreFactor = 7.8;
  } else if (hasBright && colors.length > 2) {
    harmonyType = "High-energy Electric Palette";
    colorScoreFactor = 8.0;
  } else if (hasCool && !hasWarm) {
    harmonyType = "Cool Monotone Harmony";
    colorScoreFactor = 8.8;
  } else if (hasWarm && !hasCool) {
    harmonyType = "Warm Earthy Cohesion";
    colorScoreFactor = 8.9;
  }
  
  // 2. Perform analysis based on Occasion Suitability
  let occasionScore = 8.0;
  let occasionFeedback = "";
  let occasionWeaknesses = [];
  let occasionSuggestions = [];
  
  switch(occasion) {
    case "casual":
      occasionScore = 9.0;
      if (darkCount >= 3) {
        occasionScore -= 0.5;
        occasionWeaknesses.push("Slightly heavy or dark tone for a casual daytime vibe.");
        occasionSuggestions.push("Consider softening the look with a lighter top or introducing a pastel color.");
      }
      if (hasBright) {
        occasionScore += 0.5;
        occasionFeedback = "The bright accent gives this casual outfit an energetic, modern streetwear feel.";
      } else {
        occasionFeedback = "An excellent, understated casual palette. Perfectly balanced and easy on the eyes.";
      }
      break;
      
    case "formal":
      occasionScore = 8.5;
      const formalNeutrals = colors.filter(c => ["Charcoal Black", "Crisp White", "Alabaster White", "Midnight Navy", "Deep Burgundy"].includes(c.name));
      if (formalNeutrals.length >= 2) {
        occasionScore += 1.0;
        occasionFeedback = "Very elegant. The choice of deep anchors aligns perfectly with high-standard formal dress codes.";
      } else {
        occasionScore -= 1.0;
        occasionWeaknesses.push("Lacks traditional formal anchor colors (Black, White, or Navy).");
        occasionSuggestions.push("Try swapping colorful items for charcoal, cream, or midnight navy base layers.");
      }
      if (hasBright) {
        occasionScore -= 1.5;
        occasionWeaknesses.push("Bright neon accents disrupt the formal structure and can look distracting.");
        occasionSuggestions.push("Remove high-saturated colors in favor of jewel tones (e.g., emerald, burgundy).");
      }
      break;
      
    case "business":
      occasionScore = 8.5;
      const businessSafe = colors.filter(c => ["Charcoal Black", "Crisp White", "Warm Cream", "Desert Tan", "Slate Grey", "Midnight Navy", "Olive Green"].includes(c.name));
      if (businessSafe.length >= 2) {
        occasionScore += 0.8;
        occasionFeedback = "Polished and professional. These neutral tones present an authoritative yet approachable business casual look.";
      } else {
        occasionScore -= 0.8;
        occasionWeaknesses.push("The palette is a bit colorful or unstructured for standard business settings.");
        occasionSuggestions.push("Replace active color pieces with beige, grey, or tan blazers/trousers.");
      }
      if (hasBright) {
        occasionScore -= 1.0;
        occasionWeaknesses.push("Vibrant neon colors are generally too loud for professional office environments.");
      }
      break;
      
    case "date":
      occasionScore = 8.8;
      const warmAccents = colors.filter(c => ["Deep Burgundy", "Blush Pink", "Coral Accent", "Terracotta Rust", "Warm Cream"].includes(c.name));
      if (warmAccents.length > 0) {
        occasionScore += 0.7;
        occasionFeedback = "Romantic and warm. The warm accent tones evoke charm and style cohesion ideal for date nights.";
      } else {
        occasionFeedback = "Sleek and attractive. Adding a touch of warm color (like a soft rust or burgundy accent) could make the ensemble pop.";
        occasionSuggestions.push("Try adding gold jewelry or a warm-toned accessory to complement the palette.");
      }
      break;
      
    case "streetwear":
      occasionScore = 9.0;
      if (hasBright || darkCount >= 2) {
        occasionScore += 0.8;
        occasionFeedback = "Excellent urban style. Streetwear thrive on contrast, graphics, and dark bases paired with electric colors.";
      } else {
        occasionScore -= 0.5;
        occasionWeaknesses.push("A bit too soft or formal for a modern streetwear look.");
        occasionSuggestions.push("Add a graphic tee, chunky sneakers, or high-contrast layers (e.g., neon highlights or solid black).");
      }
      break;
      
    case "party":
      occasionScore = 8.5;
      if (hasBright || colors.some(c => c.name === "Royal Violet" || c.name === "Crimson Red" || c.name === "Mustard Gold")) {
        occasionScore += 1.0;
        occasionFeedback = "Festive and high-energy! The vibrant palette stands out beautifully, ideal for evening parties or social events.";
      } else {
        occasionFeedback = "Chic, but could use more energy. A sparkling accessory or bold footwear could enhance the party vibe.";
        occasionSuggestions.push("Add metallic accessories (silver/gold) or a bold jacket/shoe to catch the lights.");
      }
      break;
      
    case "activewear":
      occasionScore = 8.8;
      if (hasBright || colors.some(c => c.type === "cool")) {
        occasionScore += 0.8;
        occasionFeedback = "Dynamic and athletic. Bright or cool tones project energy, performance, and functionality.";
      } else {
        occasionSuggestions.push("Consider incorporating active neon accents or high-contrast trims for visibility and style.");
      }
      break;
      
    default:
      occasionFeedback = "A balanced aesthetic suitable for daily wear.";
  }
  
  // 3. Apply Vibe adjustments
  let vibeScore = 8.5;
  let vibeFeedback = "";
  
  switch(vibe) {
    case "minimalist":
      if (colors.every(c => c.type === "neutral" || c.name === "Midnight Navy" || c.name === "Slate Grey")) {
        vibeScore = 9.5;
        vibeFeedback = "Peak minimalist cohesion. Sticking to low-saturated anchors gives a timeless, clean silhouette.";
      } else if (colors.length > 3) {
        vibeScore = 7.5;
        vibeFeedback = "Slightly busy for a minimalist aesthetic. Consider consolidating the layers to 2-3 main colors.";
      } else {
        vibeFeedback = "Clean color block, following the rule of simple contrasts.";
      }
      break;
      
    case "bold":
      if (hasBright || colors.filter(c => c.type !== "neutral").length >= 2) {
        vibeScore = 9.4;
        vibeFeedback = "Fabulous bold expression! The fearless mix of hues showcases true fashion confidence.";
      } else {
        vibeScore = 7.0;
        vibeFeedback = "A bit quiet for a 'Bold' style vibe. Don't be afraid to add a vibrant accent piece or a patterned shirt.";
      }
      break;
      
    case "elegant":
      const elegantColors = colors.filter(c => ["Deep Burgundy", "Crisp White", "Warm Cream", "Midnight Navy", "Espresso Brown", "Alabaster White"].includes(c.name));
      if (elegantColors.length >= 2) {
        vibeScore = 9.5;
        vibeFeedback = "Highly refined and luxurious. These tones carry a natural elegance, conveying premium style taste.";
      } else {
        vibeFeedback = "Polished. Focus on structure, tailored cuts, and subtle accessories to elevate elegance.";
      }
      break;
      
    case "cozy":
      const cozyColors = colors.filter(c => ["Desert Tan", "Warm Cream", "Heather Grey", "Espresso Brown", "Blush Pink", "Olive Green"].includes(c.name));
      if (cozyColors.length >= 2) {
        vibeScore = 9.2;
        vibeFeedback = "Enormously comfortable and inviting. The soft, textured, and warm colors feel relaxed and cozy.";
      } else {
        vibeFeedback = "Relaxed. Heavy textures (knits, fleece) and earthy tones are perfect for this aesthetic.";
      }
      break;
      
    case "edge":
      if (colors.some(c => c.name === "Charcoal Black" || c.name === "Slate Grey") && (hasBright || colors.some(c => c.name === "Crimson Red" || c.name === "Royal Violet"))) {
        vibeScore = 9.3;
        vibeFeedback = "Grungy and rebellious. The dark base with intense accents hits the exact rock/alternative vibe.";
      } else {
        vibeScore = 8.0;
        vibeFeedback = "To enhance the grunge/edgy feel, style black denim, metal accessories, or boots.";
      }
      break;
      
    default:
      vibeFeedback = "Balanced outfit composition.";
  }
  
  // 4. Fit & Cohesion scoring (simulated with some variance, influenced slightly by notes and color profile)
  let fitScore = 8.0;
  let cohesionScore = 8.2;
  
  // Parse notes for styling cues
  if (notes) {
    const lowercaseNotes = notes.toLowerCase();
    if (lowercaseNotes.includes("oversized") || lowercaseNotes.includes("baggy") || lowercaseNotes.includes("loose")) {
      if (vibe === "streetwear" || vibe === "cozy") {
        fitScore = 9.2;
      } else if (vibe === "elegant") {
        fitScore = 7.5;
        occasionWeaknesses.push("Oversized silhouettes can look too relaxed for highly formal or elegant attire.");
        occasionSuggestions.push("Try a tailored blazer or cinched belt to add definition and structure.");
      }
    }
    if (lowercaseNotes.includes("tight") || lowercaseNotes.includes("slim") || lowercaseNotes.includes("fitted")) {
      if (vibe === "elegant" || occasion === "formal") {
        fitScore = 9.0;
      }
    }
    if (lowercaseNotes.includes("shoes") || lowercaseNotes.includes("sneakers") || lowercaseNotes.includes("boots")) {
      cohesionScore += 0.5;
    }
  } else {
    // Standard random variance to keep it dynamic and look organic
    fitScore = 8.0 + Math.random() * 1.2;
    cohesionScore = 8.0 + Math.random() * 1.0;
  }
  
  // Calculate average overall rating out of 10
  const finalRating = parseFloat(((colorScoreFactor + occasionScore + vibeScore + fitScore + cohesionScore) / 5).toFixed(1));
  
  // 5. Generate Strengths and Weaknesses lists
  const strengths = [];
  const weaknesses = [];
  
  // Color analysis strengths
  if (colorScoreFactor >= 9.0) {
    strengths.push("Exceptional color curation that demonstrates cohesive styling principles.");
  } else if (colorScoreFactor >= 8.5) {
    strengths.push(`Cohesive ${harmonyType} color palette creates a pleasing visual layout.`);
  } else {
    strengths.push("Good color blocking and clear distinction between clothing layers.");
  }
  
  // Vibe alignment
  if (vibeScore >= 9.0) {
    strengths.push(`Perfect execution of a ${vibe.charAt(0).toUpperCase() + vibe.slice(1)} style vibe.`);
  } else {
    strengths.push(`Good foundation for a ${vibe} silhouette.`);
  }
  
  // Occasion alignment
  if (occasionScore >= 9.0) {
    strengths.push(`Highly appropriate selection for a ${occasion.charAt(0).toUpperCase() + occasion.slice(1)} setting.`);
  }
  
  // Weaknesses
  if (occasionWeaknesses.length > 0) {
    weaknesses.push(...occasionWeaknesses);
  }
  
  if (vibeScore < 8.0) {
    weaknesses.push(`Aesthetic mismatch: Colors don't fully communicate the '${vibe}' theme.`);
  }
  
  if (colors.length > 3 && vibe === "minimalist") {
    weaknesses.push("Too many competing colors disrupt the minimalist focal lines.");
  }
  
  if (colors.length <= 2 && vibe === "bold") {
    weaknesses.push("Lacks the color contrast needed to make a strong visual statement.");
  }
  
  if (weaknesses.length === 0) {
    weaknesses.push("The visual balance is solid; could only be enhanced by minor accessories.");
  }
  
  // 6. Formulate suggestions
  const suggestionsList = [];
  
  // Occasion/color suggestions
  if (occasionSuggestions.length > 0) {
    occasionSuggestions.forEach(s => {
      suggestionsList.push({ category: "Alternative Colors", text: s });
    });
  } else {
    // Default color advice
    const contrastingHex = colors[0].isDark ? "#ffffff" : "#0a0a0a";
    const contrastName = colors[0].isDark ? "Crisp White" : "Charcoal Black";
    suggestionsList.push({
      category: "Alternative Colors",
      text: `Try introducing a layer of ${contrastName} (${contrastingHex}) to build high-end contrast into the layout.`
    });
  }
  
  // Accessories Suggestions based on vibe
  let accessoryText = "Add silver or gold minimalist jewelry to elevate the look.";
  if (vibe === "streetwear" || vibe === "edge") {
    accessoryText = "Style with a black utility crossbody bag, metal utility chains, or a beanie.";
  } else if (vibe === "elegant") {
    accessoryText = "Add a classic leather wristwatch, pearl earrings, or a textured leather handbag.";
  } else if (vibe === "cozy") {
    accessoryText = "Incorporate a chunky cable-knit scarf or a neutral canvas tote bag.";
  } else if (vibe === "bold") {
    accessoryText = "Go for chunky colorful resin rings or a bright statement belt to lock the gaze.";
  }
  suggestionsList.push({ category: "Accessories", text: accessoryText });
  
  // Footwear Suggestions based on vibe/occasion
  let footwearText = "Low-top white leather sneakers are highly versatile for this look.";
  if (occasion === "formal") {
    footwearText = colors[0].isDark && colors.some(c => c.name.includes("Brown")) 
      ? "Dark brown leather Oxford dress shoes or classic monk straps."
      : "Patent black leather derby dress shoes or elegant heels.";
  } else if (occasion === "business") {
    footwearText = "Sleek suede loafers, classic chelsea boots, or leather derbies.";
  } else if (vibe === "streetwear") {
    footwearText = "Chunky retro runners, high-top skate sneakers, or combat boots.";
  } else if (vibe === "edge") {
    footwearText = "Platform Doc Martens or distressed combat leather boots.";
  } else if (occasion === "activewear") {
    footwearText = "Performance trainers or custom athletic running shoes matching the accent color.";
  }
  suggestionsList.push({ category: "Footwear Swap", text: footwearText });
  
  // Trending Advice
  let trendingText = "Monochromatic tailoring is highly on-trend. Pair similar tones for a premium aesthetic.";
  if (vibe === "streetwear") {
    trendingText = "Cargo utility silhouettes paired with tight cropped tops are dominating urban trends.";
  } else if (vibe === "minimalist") {
    trendingText = "Quiet luxury: Invest in heavy-cotton basics with zero visible branding.";
  } else if (vibe === "elegant") {
    trendingText = "Structured silhouettes with relaxed wide-leg trousers are heavily trending.";
  }
  suggestionsList.push({ category: "Trending Adjustments", text: trendingText });
  
  // 7. Assemble the AI Critique text
  const mainParagraph = `StyleVibe AI Analysis: This outfit scores a **${finalRating}/10**, characterized by a **${harmonyType}** color layout. ${occasionFeedback} ${vibeFeedback} The contrast distribution holds a balance of ${darkCount} dark and ${lightCount} light tones, which provides clear shape separation. To elevate this look further, focus on the suggestions outlined below, specifically regarding footwear coordination and accessory placement.`;
  
  return {
    score: finalRating,
    breakdown: {
      harmony: Math.round(colorScoreFactor * 10),
      fit: Math.round(fitScore * 10),
      cohesion: Math.round(cohesionScore * 10),
      suitability: Math.round(occasionScore * 10)
    },
    harmonyType,
    strengths,
    weaknesses,
    suggestions: suggestionsList,
    critiqueText: mainParagraph
  };
}
