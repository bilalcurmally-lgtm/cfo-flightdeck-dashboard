export const state = {
  rawRows: [],
  records: [],
  visibleRows: [],
  columns: [],
  grain: "daily",
  dateFormat: "auto",
  filters: {
    startDate: "",
    endDate: "",
    search: "",
    flows: new Set(["revenue", "outflow"]),
    selectedHeads: new Set(),
    headSearch: "",
    focusedPeriod: "",
    focusedHead: ""
  },
  mapping: {
    date: "",
    amount: "",
    type: "",
    head: "",
    parent: "",
    description: ""
  }
};
