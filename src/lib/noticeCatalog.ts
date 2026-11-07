/** Informational notices only: never presented as live warnings or delivered messages. */
export type Notice = { id: string; title: string; body: string; kind: "guidance" | "service"; source: string };
export const notices: Notice[] = [
  {id:"preparedness",title:"Flood preparedness checklist",body:"Review your household plan, essential supplies and safe higher-ground meeting place.",kind:"guidance",source:"FloodGuard general safety guidance"},
  {id:"reporting",title:"About incident reporting",body:"Submitting a FloodGuard report does not notify emergency responders. Use official emergency channels in immediate danger.",kind:"service",source:"FloodGuard service limitation"},
  {id:"postcode",title:"Digital postcode status",body:"Postcode validation and location intelligence depend on authorised NIPOST access. Never assume a postcode proves a safe location.",kind:"service",source:"FloodGuard integration notice"}
];
