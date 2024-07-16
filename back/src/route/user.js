// Підключаємо технологію express для back-end сервера
const express = require('express')
// Cтворюємо роутер - місце, куди ми підключаємо ендпоїнти
const router = express.Router()

const { User } = require('../class/user')
const { Session } = require('../class/session')
const { Finance } = require('../class/finance')
const { Notification } = require('../class/notification')

// ================================================================
User.newUserConfirm('vlad@mail.com', 'www', 5750.65)
User.newUserConfirm('tomka@mail.com', 'eee', 7073.27)
User.newUserConfirm('www', 'www', 2580)

// router.get Створює нам один ентпоїнт

// ↙️ тут вводимо шлях (PATH) до сторінки

router.post('/signup', function (req, res) {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        message:
          'Потрібно передати всі дані для створення користувача',
      })
    }

    const control = User.getByEmailConfirm(email)

    if (control) {
      return res.status(400).json({
        message: 'Користувач такий вже існує',
      })
    }

    const newUser = User.create(email, password)
    const confirmCode = User.generateCode()
    newUser.id = confirmCode
    console.log('New User', newUser)

    return res.status(200).json({
      user: {
        email: newUser.email,
        password: newUser.password,
        id: newUser.id,
      },
    })
  } catch (error) {
    return res.status(400).json({
      message: 'SignUp problem',
    })
  }
})
// ===========

router.post('/signup-confirm', function (req, res) {
  try {
    const { code, id } = req.body

    console.log(`User id:`, id)
    console.log(`Code:`, code)

    if (!code || !id) {
      return res.status(400).json({
        message:
          'Потрібно передати всі дані для підтвердження реєстрації',
      })
    }

    const user = User.getById(id)

    if (!user) {
      return res.status(404).json({
        message: 'Користувача з таким ID не знайдено',
      })
    }

    if (code !== id) {
      return res.status(400).json({
        message: 'Неправильний код підтвердження',
      })
    }

    const confirmUser = User.createConfirm(user)
    const session = Session.create(confirmUser)

    if (!confirmUser) {
      return res.status(400).json({
        message: 'Користувача не знайдено',
      })
    }

    return res.status(200).json({
      id: confirmUser.id,
      message: 'Реєстрація підтверджена успішно',
      session,
    })
  } catch (error) {
    console.error('Помилка:', error)
    return res.status(400).json({
      message: 'Виникла помилка при обробці запиту',
    })
  }
})
// ================

router.post('/signin', function (req, res) {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        message:
          'Потрібно передати всі дані для створення користувача',
      })
    }

    const confirmUser = User.getByEmailConfirm(email)

    if (!confirmUser) {
      return res.status(400).json({
        message: 'Користувача не знайдено',
      })
    }

    if (password !== confirmUser.password) {
      return res.status(400).json({
        message: 'Пароль введено не вірно',
      })
    }

    const session = Session.create(confirmUser)

    return res.status(200).json({
      id: confirmUser.id,
      message: 'Вхід виконаний успішно',
      session,
    })
  } catch (error) {
    return res.status(400).json({
      message: 'Виникла помилка при обробці запиту',
    })
  }
})
// ================

router.post('/recovery', function (req, res) {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({
        message: 'Потрібно передати email',
      })
    }

    const control = User.getByEmailConfirm(email)

    if (!control) {
      return res.status(400).json({
        message: 'Користувача не знайдено',
      })
    }

    return res.status(200).json({
      id: control.id,
      message: 'Код відправлено',
    })
  } catch (error) {
    return res.status(400).json({
      message: 'Виникла помилка при обробці запиту',
    })
  }
})
// ===========

router.post('/recovery-confirm', function (req, res) {
  try {
    const { code, id, password } = req.body

    if (!code || !id || !password) {
      return res.status(400).json({
        message:
          'Потрібно передати всі дані для зміни паролю',
      })
    }

    const user = User.getByIdConfirm(id)

    if (!user) {
      return res.status(404).json({
        message: 'Користувача з таким ID не знайдено',
      })
    }

    console.log('Знайдений користувач:', user)

    if (code !== id) {
      return res.status(400).json({
        message: 'Неправильний код підтвердження',
      })
    }

    user.password = password

    const session = Session.create(user)

    if (!user) {
      return res.status(400).json({
        message: 'Користувача не знайдено',
      })
    }

    return res.status(200).json({
      id: user.id,
      message: 'Пароль успішно змінено',
      session,
    })
  } catch (error) {
    console.error('Помилка:', error)
    return res.status(400).json({
      message: 'Виникла помилка при обробці запиту',
    })
  }
})
// ================

router.get('/balance', function (req, res) {
  try {
    const { id } = req.query

    const user = User.getByIdConfirm(id)

    const transactions = Finance.getTransactions(user.email)

    if (!user) {
      return res.status(400).json({
        message: 'Користувача не знайдено',
      })
    }

    return res.status(200).json({
      message: 'Вхід виконаний успішно',
      balance: user.balance,
      email: user.email,
      transactions,
    })
  } catch (error) {
    console.error('Помилка:', error)
    return res.status(400).json({
      message: 'Виникла помилка при обробці запиту',
    })
  }
})
// ================

router.get('/notification', function (req, res) {
  try {
    const { id } = req.query

    const user = User.getByIdConfirm(id)

    const notifications = Notification.getById(user.id)

    if (!user) {
      return res.status(400).json({
        message: 'Користувача не знайдено',
      })
    }

    return res.status(200).json({
      message: 'Список повідомлень',
      notifications,
    })
  } catch (error) {
    console.error('Помилка:', error)
    return res.status(400).json({
      message: 'Виникла помилка при обробці запиту',
    })
  }
})
// ================

router.get('/transaction', function (req, res) {
  try {
    const { id } = req.query

    const transaction = Finance.getById(id)

    if (!transaction) {
      return res.status(400).json({
        message: 'Не знайдено трансакцію',
      })
    }

    return res.status(200).json({
      message: 'Дані трансакції',
      transaction: transaction,
    })
  } catch (error) {
    console.error('Помилка:', error)
    return res.status(400).json({
      message: 'Виникла помилка при обробці запиту',
    })
  }
})
// ================

router.post('/change-email', function (req, res) {
  try {
    const { id, email, password } = req.body

    const user = User.getByIdConfirm(id)

    if (!user) {
      return res.status(400).json({
        message: 'Користувача не знайдено',
      })
    }

    if (user.password !== password) {
      return res.status(400).json({
        message: 'Невірний пароль',
      })
    }

    user.email = email
    Notification.note_Email(user)

    return res.status(200).json({
      message: 'Email успішно змінено',
    })
  } catch (error) {
    console.error('Помилка:', error)
    return res.status(400).json({
      message: 'Виникла помилка при обробці запиту',
    })
  }
})
// ================

router.post('/change-password', function (req, res) {
  try {
    const { id, oldPassword, newPassword } = req.body

    const user = User.getByIdConfirm(id)

    if (!user) {
      return res.status(400).json({
        message: 'Користувача не знайдено',
      })
    }

    if (user.password !== oldPassword) {
      return res.status(400).json({
        message: 'Невірний старий пароль',
      })
    }

    user.password = newPassword
    Notification.note_Password(user)

    return res.status(200).json({
      message: 'Пароль успішно змінено',
    })
  } catch (error) {
    console.error('Помилка:', error)
    return res.status(400).json({
      message: 'Виникла помилка при обробці запиту',
    })
  }
})
// ================

router.post('/recive', function (req, res) {
  try {
    const { user, amount, name } = req.body

    const userMoney = User.getByIdConfirm(user.id)
    const newAmount = Number(amount)

    if (!userMoney) {
      return res.status(400).json({
        message: 'Користувача не знайдено',
      })
    }

    if (!amount) {
      return res.status(400).json({
        message: 'Введіть суму!',
      })
    }

    const deposit = Finance.deposit(
      userMoney,
      newAmount,
      name,
    )

    console.log('DEPOSIT INFO', deposit)

    const newBalance = deposit
    Notification.note_inTrans(userMoney)

    return res.status(200).json({
      message: 'Рахунок успішно поповнено!',
      newBalance: newBalance,
    })
  } catch (error) {
    console.error('Помилка:', error)
    return res.status(400).json({
      message: 'Виникла помилка при обробці запиту',
    })
  }
})
// ================

router.post('/send', function (req, res) {
  try {
    const { user, amount, name } = req.body

    console.log('SENDING_BODY', req.body)

    const userMoney = User.getByIdConfirm(user.id)
    const userGet = User.getByEmailConfirm(name)
    const newAmount = Number(amount)

    if (!userMoney || !userGet) {
      return res.status(400).json({
        message: 'Користувача не знайдено',
      })
    }

    if (!amount || !name) {
      return res.status(400).json({
        message: 'Введіть всі дані!',
      })
    }

    const transfer = Finance.transfer(
      userMoney,
      name,
      newAmount,
    )

    console.log('TRANSFER INFO', transfer)

    const newBalance = transfer.senderBalance
    Notification.note_inTrans(userGet)
    Notification.note_outTrans(userMoney)

    return res.status(200).json({
      message: 'Кошти успішно відправлено!',
      newBalance: newBalance,
    })
  } catch (error) {
    console.error('Помилка:', error)
    return res.status(400).json({
      message: 'Виникла помилка при обробці запиту',
    })
  }
})
// ================

// Підключаємо роутер до бек-енду
module.exports = router
