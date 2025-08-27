// ROI Calculation Utilities for GlassWallet - Sales Call Metrics Version

export interface ROIInputs {
  // Sales Call Metrics (from prospect interviews)
  adSpend: number;              // Monthly ad spend
  callsBooked: number;          // Monthly calls booked
  currentQualificationRate: number; // % of current calls that are with people who have money (0-100)
  showRate: number;             // % who show up (0-100)
  pitchRate: number;            // % who get through full presentation (0-100)
  affordabilityLossRate: number; // % lost to affordability (0-100)
  closeRate: number;            // % who actually buy (0-100)
  aov: number;                  // Average Order Value (deal size)
  collectedPercent: number;     // % of revenue actually collected (0-100)
  avgCallLength: number;        // Average call length in minutes
  followUpTimePerLead: number;  // Time spent in minutes on follow up per lead
}

export interface ROIResults {
  // Current Sales Funnel Analysis
  currentFunnel: {
    callsBooked: number;
    qualifiedCalls: number;       // Calls with people who have money
    unqualifiedCalls: number;     // Calls with people without money  
    showUps: number;
    completedPitches: number;
    affordableProspects: number;
    closedSales: number;
    actualRevenue: number;        // After collection rate
    annualRevenue: number;
  };
  
  // Current Costs
  currentCosts: {
    monthlyCosts: {
      adSpend: number;
      total: number;
    };
    annualCosts: {
      adSpend: number;
      total: number;
    };
    efficiency: {
      costPerLead: number;
      costPerSale: number;
      timePerSale: number;        // Total minutes per successful sale
    };
  };
  
  // Call Quality Improvement Analysis
  callQualityImprovement: {
    currentQualifiedCalls: number;    // Current qualified calls per month
    currentUnqualifiedCalls: number;  // Current unqualified calls per month
    glassWalletQualifiedCalls: number; // GlassWallet qualified calls per month  
    glassWalletUnqualifiedCalls: number; // GlassWallet unqualified calls per month
    additionalQualifiedCalls: number;  // Net increase in qualified conversations
    qualificationRateImprovement: number; // Percentage point improvement
    wastedTimeReduction: number;      // Hours saved not talking to unqualified leads
    qualifiedCallRevenuePotential: number; // Revenue potential per qualified call
  };

  // Time Waste Analysis
  timeWasteAnalysis: {
    currentWastedHours: number;       // Hours wasted on unqualified calls
    glassWalletWastedHours: number;   // Hours wasted with GlassWallet
    timeRedirected: number;           // Hours redirected to qualified prospects
    revenuePerQualifiedHour: number;  // Revenue potential per hour on qualified calls
    redirectedRevenueOpportunity: number; // Revenue opportunity from redirected time
  };

  // GlassWallet Impact on Sales Funnel
  improvements: {
    preQualificationRate: number;   // % of unqualified leads filtered out
    improvedShowRate: number;       // Higher show rate with qualified leads
    reducedAffordabilityLoss: number; // Fewer affordability objections
    improvedCloseRate: number;      // Better close rate with qualified leads
    reducedFollowUpTime: number;    // Less time chasing unqualified leads
  };
  
  // Future State with GlassWallet
  futureFunnel: {
    qualifiedCallsBooked: number;
    showUps: number;
    completedPitches: number;
    affordableProspects: number;
    closedSales: number;
    actualRevenue: number;
    annualRevenue: number;
  };
  
  futureCosts: {
    monthlyCosts: {
      adSpend: number;              // Same ad spend
      glassWalletFee: number;
      creditCosts: number;
      total: number;
    };
    annualCosts: {
      adSpend: number;
      glassWalletFee: number;
      creditCosts: number;
      total: number;
    };
    efficiency: {
      costPerLead: number;
      costPerSale: number;
      timePerSale: number;
    };
  };
  
  // ROI Summary
  roiSummary: {
    additionalMonthlyRevenue: number;
    redirectedRevenueOpportunity: number; // Revenue from redirected time
    totalMonthlyBenefit: number;
    glassWalletInvestment: number;  // Monthly
    netMonthlyBenefit: number;
    roiPercentage: number;          // Annual ROI
    paybackMonths: number;
    breakEvenPoint: string;
  };
}

// GlassWallet impact assumptions (conservative estimates based on credit pre-qualification)
const GLASSWALLET_IMPACT = {
  // GlassWallet qualification rate - credit score + debt-to-income pre-qualification
  glassWalletQualificationRate: 85,  // 85% of GlassWallet calls are with people who have money
  
  // Pre-qualification filters out unqualified leads before they get to sales calls
  preQualificationFilterRate: 35,    // 35% of leads filtered out as unqualified
  
  // Remaining leads are higher quality, improving funnel metrics
  showRateImprovement: 15,           // 15% improvement (qualified leads show up more)
  affordabilityLossReduction: 60,    // 60% reduction in affordability objections
  closeRateImprovement: 25,          // 25% improvement in close rate
  followUpTimeReduction: 40          // 40% less time chasing unqualified leads
};


// GlassWallet pricing
const GLASSWALLET_PRICING = {
  monthlyFee: 199,  // Platform access fee
  creditCost: 5     // Cost per credit pull (Bronze tier pricing)
};

export function calculateROI(inputs: ROIInputs): ROIResults {
  // Calculate current call qualification breakdown
  const currentQualifiedCalls = inputs.callsBooked * (inputs.currentQualificationRate / 100);
  const currentUnqualifiedCalls = inputs.callsBooked - currentQualifiedCalls;
  
  // Calculate current sales funnel performance
  const showUps = inputs.callsBooked * (inputs.showRate / 100);
  const completedPitches = showUps * (inputs.pitchRate / 100);
  const affordableProspects = completedPitches * (1 - inputs.affordabilityLossRate / 100);
  const closedSales = affordableProspects * (inputs.closeRate / 100);
  const grossRevenue = closedSales * inputs.aov;
  const actualRevenue = grossRevenue * (inputs.collectedPercent / 100);
  
  // Calculate current time allocation
  const totalCallTime = inputs.callsBooked * inputs.avgCallLength;
  const totalFollowUpTime = inputs.callsBooked * inputs.followUpTimePerLead;
  const totalTimeInvestment = totalCallTime + totalFollowUpTime; // minutes per month
  
  // Current efficiency metrics
  const costPerLead = inputs.adSpend / inputs.callsBooked;
  const costPerSale = inputs.adSpend / Math.max(closedSales, 1);
  const timePerSale = totalTimeInvestment / Math.max(closedSales, 1);
  
  // GlassWallet call qualification improvements
  const glassWalletQualifiedCalls = inputs.callsBooked * (GLASSWALLET_IMPACT.glassWalletQualificationRate / 100);
  const glassWalletUnqualifiedCalls = inputs.callsBooked - glassWalletQualifiedCalls;
  const additionalQualifiedCalls = glassWalletQualifiedCalls - currentQualifiedCalls;
  const qualificationRateImprovement = GLASSWALLET_IMPACT.glassWalletQualificationRate - inputs.currentQualificationRate;
  
  // Time Waste Analysis
  const currentWastedHours = (currentUnqualifiedCalls * (inputs.avgCallLength + inputs.followUpTimePerLead)) / 60;
  const glassWalletWastedHours = (glassWalletUnqualifiedCalls * (inputs.avgCallLength + inputs.followUpTimePerLead)) / 60;
  const timeRedirected = currentWastedHours - glassWalletWastedHours;
  
  // Revenue potential per qualified call
  const qualifiedCallRevenuePotential = actualRevenue / Math.max(currentQualifiedCalls, 1);
  
  // Revenue potential per hour spent on qualified calls 
  const qualifiedTimeHours = (currentQualifiedCalls * (inputs.avgCallLength + inputs.followUpTimePerLead)) / 60;
  const revenuePerQualifiedHour = actualRevenue / Math.max(qualifiedTimeHours, 1);
  
  // Revenue opportunity from redirected time
  const redirectedRevenueOpportunity = timeRedirected * revenuePerQualifiedHour;
  
  // Calculate time savings for legacy compatibility
  const wastedTimeReduction = timeRedirected;

  // GlassWallet improvements
  // Pre-qualification reduces unqualified calls, improving all downstream metrics
  const qualifiedCallsBooked = inputs.callsBooked; // Same number of calls, but higher quality
  
  // Calculate improvements
  const improvedShowRate = Math.min(95, inputs.showRate * (1 + GLASSWALLET_IMPACT.showRateImprovement / 100));
  const improvedAffordabilityLoss = inputs.affordabilityLossRate * (1 - GLASSWALLET_IMPACT.affordabilityLossReduction / 100);
  const improvedCloseRate = Math.min(95, inputs.closeRate * (1 + GLASSWALLET_IMPACT.closeRateImprovement / 100));
  const reducedFollowUpTime = inputs.followUpTimePerLead * (1 - GLASSWALLET_IMPACT.followUpTimeReduction / 100);
  
  // Future funnel performance
  const futureShowUps = qualifiedCallsBooked * (improvedShowRate / 100);
  const futureCompletedPitches = futureShowUps * (inputs.pitchRate / 100);
  const futureAffordableProspects = futureCompletedPitches * (1 - improvedAffordabilityLoss / 100);
  const futureClosedSales = futureAffordableProspects * (improvedCloseRate / 100);
  const futureGrossRevenue = futureClosedSales * inputs.aov;
  const futureActualRevenue = futureGrossRevenue * (inputs.collectedPercent / 100);
  
  // Future time allocation
  const futureTotalCallTime = qualifiedCallsBooked * inputs.avgCallLength;
  const futureTotalFollowUpTime = qualifiedCallsBooked * reducedFollowUpTime;
  const futureTotalTimeInvestment = futureTotalCallTime + futureTotalFollowUpTime;
  
  // GlassWallet costs
  const glassWalletMonthlyFee = GLASSWALLET_PRICING.monthlyFee;
  const creditCosts = qualifiedCallsBooked * GLASSWALLET_PRICING.creditCost; // Credit check all booked calls
  
  // Future efficiency metrics
  const futureCostPerLead = inputs.adSpend / qualifiedCallsBooked;
  const futureCostPerSale = (inputs.adSpend + glassWalletMonthlyFee + creditCosts) / Math.max(futureClosedSales, 1);
  const futureTimePerSale = futureTotalTimeInvestment / Math.max(futureClosedSales, 1);
  
  // ROI calculations
  const additionalMonthlyRevenue = futureActualRevenue - actualRevenue;
  const totalMonthlyBenefit = additionalMonthlyRevenue + redirectedRevenueOpportunity;
  const glassWalletInvestment = glassWalletMonthlyFee + creditCosts;
  const netMonthlyBenefit = totalMonthlyBenefit - glassWalletInvestment;
  
  const annualNetBenefit = netMonthlyBenefit * 12;
  const annualInvestment = glassWalletInvestment * 12;
  const roiPercentage = annualInvestment > 0 ? (annualNetBenefit / annualInvestment) * 100 : 0;
  const paybackMonths = glassWalletInvestment > 0 ? glassWalletInvestment / Math.max(totalMonthlyBenefit, 1) : 0;
  
  return {
    currentFunnel: {
      callsBooked: inputs.callsBooked,
      qualifiedCalls: currentQualifiedCalls,
      unqualifiedCalls: currentUnqualifiedCalls,
      showUps: showUps,
      completedPitches: completedPitches,
      affordableProspects: affordableProspects,
      closedSales: closedSales,
      actualRevenue: actualRevenue,
      annualRevenue: actualRevenue * 12
    },
    
    currentCosts: {
      monthlyCosts: {
        adSpend: inputs.adSpend,
        total: inputs.adSpend
      },
      annualCosts: {
        adSpend: inputs.adSpend * 12,
        total: inputs.adSpend * 12
      },
      efficiency: {
        costPerLead: costPerLead,
        costPerSale: costPerSale,
        timePerSale: timePerSale
      }
    },

    callQualityImprovement: {
      currentQualifiedCalls: currentQualifiedCalls,
      currentUnqualifiedCalls: currentUnqualifiedCalls,
      glassWalletQualifiedCalls: glassWalletQualifiedCalls,
      glassWalletUnqualifiedCalls: glassWalletUnqualifiedCalls,
      additionalQualifiedCalls: additionalQualifiedCalls,
      qualificationRateImprovement: qualificationRateImprovement,
      wastedTimeReduction: wastedTimeReduction,
      qualifiedCallRevenuePotential: qualifiedCallRevenuePotential
    },

    timeWasteAnalysis: {
      currentWastedHours: currentWastedHours,
      glassWalletWastedHours: glassWalletWastedHours,
      timeRedirected: timeRedirected,
      revenuePerQualifiedHour: revenuePerQualifiedHour,
      redirectedRevenueOpportunity: redirectedRevenueOpportunity
    },
    
    improvements: {
      preQualificationRate: GLASSWALLET_IMPACT.preQualificationFilterRate,
      improvedShowRate: improvedShowRate - inputs.showRate,
      reducedAffordabilityLoss: inputs.affordabilityLossRate - improvedAffordabilityLoss,
      improvedCloseRate: improvedCloseRate - inputs.closeRate,
      reducedFollowUpTime: inputs.followUpTimePerLead - reducedFollowUpTime
    },
    
    futureFunnel: {
      qualifiedCallsBooked: qualifiedCallsBooked,
      showUps: futureShowUps,
      completedPitches: futureCompletedPitches,
      affordableProspects: futureAffordableProspects,
      closedSales: futureClosedSales,
      actualRevenue: futureActualRevenue,
      annualRevenue: futureActualRevenue * 12
    },
    
    futureCosts: {
      monthlyCosts: {
        adSpend: inputs.adSpend,
        glassWalletFee: glassWalletMonthlyFee,
        creditCosts: creditCosts,
        total: inputs.adSpend + glassWalletMonthlyFee + creditCosts
      },
      annualCosts: {
        adSpend: inputs.adSpend * 12,
        glassWalletFee: glassWalletMonthlyFee * 12,
        creditCosts: creditCosts * 12,
        total: (inputs.adSpend + glassWalletMonthlyFee + creditCosts) * 12
      },
      efficiency: {
        costPerLead: futureCostPerLead,
        costPerSale: futureCostPerSale,
        timePerSale: futureTimePerSale
      }
    },
    
    roiSummary: {
      additionalMonthlyRevenue: additionalMonthlyRevenue,
      redirectedRevenueOpportunity: redirectedRevenueOpportunity,
      totalMonthlyBenefit: totalMonthlyBenefit,
      glassWalletInvestment: glassWalletInvestment,
      netMonthlyBenefit: netMonthlyBenefit,
      roiPercentage: roiPercentage,
      paybackMonths: paybackMonths,
      breakEvenPoint: `${Math.ceil(paybackMonths)} months`
    }
  };
}

// Utility functions for formatting
export function formatCurrency(amount: number, decimals: number = 0): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(amount);
}

export function formatPercentage(percentage: number, decimals: number = 1): string {
  return `${percentage.toFixed(decimals)}%`;
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(Math.round(num));
}