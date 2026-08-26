// Every validator returns a plain object of { field: message }.
// An empty object means "valid", so callers all check the same way:
//
//   errors.value = someValidate(...)
//   if (Object.keys(errors.value).length > 0) return
//
// Assigning a fresh object each submit also clears the previous errors,
// so there's nothing to reset by hand.

const isBlank = (v) => v === null || v === undefined || String(v).trim() === ''

const isPositive = (v) => !isNaN(Number(v)) && Number(v) > 0

export const accountValidate = (name, balance) => {
  const err = {}
  if (isBlank(name)) err.name = 'Name is required'
  // balance is optional, but if it's filled in it has to be a number
  if (!isBlank(balance) && isNaN(Number(balance))) {
    err.balance = 'Opening balance must be a number'
  }
  return err
}

export const categoryValidate = (name, type) => {
  const err = {}
  if (isBlank(name)) err.name = 'Name is required'
  if (isBlank(type)) err.type = 'Pick expense or income'
  return err
}

export const goalValidate = (name, targetAmount) => {
  const err = {}
  if (isBlank(name)) err.name = 'Name is required'
  if (isBlank(targetAmount)) err.targetAmount = 'Target amount is required'
  else if (!isPositive(targetAmount)) err.targetAmount = 'Target amount must be greater than 0'
  return err
}

// shared by "Add money" and "Withdraw" — same three fields either way
export const goalMoveValidate = (accountId, amount, date) => {
  const err = {}
  if (isBlank(accountId)) err.accountId = 'Pick an account'
  if (isBlank(amount)) err.amount = 'Amount is required'
  else if (!isPositive(amount)) err.amount = 'Amount must be greater than 0'
  if (isBlank(date)) err.date = 'Pick a date'
  return err
}

export const budgetValidate = (categoryId, amount, period) => {
  const err = {}
  if (isBlank(categoryId)) err.categoryId = 'Pick a category'
  if (isBlank(amount)) err.amount = 'Target amount is required'
  else if (!isPositive(amount)) err.amount = 'Target amount must be greater than 0'
  if (isBlank(period)) err.period = 'Pick a period'
  return err
}

export const transferValidate = (fromAccountId, toAccountId, amount, date) => {
  const err = {}
  if (isBlank(fromAccountId)) err.fromAccount = 'Pick a source account'
  if (isBlank(toAccountId)) err.toAccount = 'Pick a destination account'
  else if (!isBlank(fromAccountId) && fromAccountId === toAccountId) {
    err.toAccount = 'Must be different from the source account'
  }
  if (isBlank(amount)) err.amount = 'Amount is required'
  else if (!isPositive(amount)) err.amount = 'Amount must be greater than 0'
  if (isBlank(date)) err.date = 'Pick a date'
  return err
}

export const transactionValidate = (accountId, categoryId, amount, date) => {
  const err = {}
  if (isBlank(accountId)) err.accountId = 'Pick an account'
  if (isBlank(categoryId)) err.categoryId = 'Pick a category'
  if (isBlank(amount)) err.amount = 'Amount is required'
  else if (!isPositive(amount)) err.amount = 'Amount must be greater than 0'
  if (isBlank(date)) err.date = 'Pick a date'
  return err
}
