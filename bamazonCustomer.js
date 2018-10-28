// define dependencies
const mysql = require("mysql");
const inquirer = require("inquirer");

// connection criteria for db
const db = mysql.createConnection({
  host: "localhost",

  port: 3306,

  user: "root",

  password: "",
  database: "bamazon_db"
})

// connect to db
db.connect((err) => {

  if (err) throw err;

  console.log(`connection established with id ${db.threadId}
  
  Welcome to Bamazon!`);

  // db.end();
  mainMenu();

});


// define functions
// function for initial search options
const mainMenu = () => {

  inquirer.prompt([
    {
      name: "searchOption",
      type: "list",
      message: "Browse...",
      choices: ["products by department", "products by item name", "all products"]
    }

  ])
    .then(userResponse => {

      switch (userResponse.searchOption) {
        case "products by department":
          deptSearch();
          break;

        case "products by item name":
          itemSearch();
          break;

        case "all products":
          browseAll();
          break;

      }
    });
}

// function for searching by department
const deptSearch = () => {

  const query = db.query("SELECT department FROM products",
    (err, prodData) => {
      if (err) throw err;

      inquirer.prompt([
        {
          name: "deptOption",
          type: "list",
          message: "Select below to see all products available in a particular department.",
          choices: prodData.map(dept => dept.department).filter((department, index, self) => self.indexOf(department) === index)

        }
      ])
        .then(choice => {

          console.log(`*******NOW VIEWING ALL ${choice.deptOption} PRODUCTS*******`)

          const query = db.query("SELECT * FROM products WHERE department = ?",
            [choice.deptOption], (err, prodByDept) => {

              if (err) throw err;

              prodByDept.forEach((product) => {

                console.log(product.stock_qty)

                if (product.stock_qty < 1) {
                  console.log(`
                Product: ${product.product_name}
                Price: $${product.price}
                **ITEM OUT OF STOCK!** Check back soon.
                Item #: ${product.item_id}
        `);

                } else {
                  console.log(`
                  Product: ${product.product_name}
                  Price: $${product.price}
                  Quantity Remaining: ${product.stock_qty}
                  Item #: ${product.item_id}
                  `)
                }

              });

            });

          selectItem();

        });

    });
}

// function to search for item by user input
const itemSearch = () => {

  inquirer.prompt([
    {
      name: "searchInput",
      type: "input",
      message: "What item are you looking for?",
    }
  ]).then(userResponse => {

    console.log(`
    *****NOW VIEWING ALL PRODUCTS RELATED TO "${userResponse.searchInput}"*****`)

    const query = db.query("SELECT * FROM products WHERE product_name LIKE ?", [`%${userResponse.searchInput}%`], (err, prodBySearch) => {

      if (err) throw err;

      prodBySearch.forEach(product => {
        if (product.stock_qty < 1) {
          console.log(`
  Product: ${product.product_name}
  Price: $${product.price}
  **ITEM OUT OF STOCK!** Check back soon.
  Item #: ${product.item_id}
`);


        } else {
          console.log(`
          Product: ${product.product_name}
          Price: $${product.price}
          Quantity Remaining: ${product.stock_qty}
          Item #: ${product.item_id}
          `)
        }
      });

      selectItem();
    });

  });

}

const browseAll = () => {

  db.query("SELECT * FROM products", (err, prodData) => {

    console.log(`
    *******NOW VIEWING ALL PRODUCTS*******`)


    if (err) throw err;

    prodData.forEach(product => {

      if (product.stock_qty < 1) {
        console.log(`
      Product: ${product.product_name}
      Price: $${product.price}
      **ITEM OUT OF STOCK!** Check back soon.
      Item #: ${product.item_id}
`);


      } else {
        console.log(`
        Product: ${product.product_name}
        Price: $${product.price}
        Quantity Remaining: ${product.stock_qty}
        Item #: ${product.item_id}
        `)
      }

    });

  })

  selectItem();

}

// function for choosing a specific item by item #
const selectItem = () => {

  db.query("SELECT * FROM products",
    (err, prodSelect) => {
      if (err) throw err;

      // ask for item #
      inquirer.prompt([
        {
          name: "itemChoice",
          type: "input",
          message: "Please enter the item # of the product you wish to purchase",

        },
        // ask for qty
        {
          name: "qtyChoice",
          type: "input",
          message: "How many would you like to purchase?",
          default: 1,
          validate: (qtyInput) => {
            if (!isNaN(qtyInput)) {
              return true;
            } else {
              console.log(`
          Please enter a valid quantity.
          `);
              return false;
            }

          }
        },
        {
          name: "howPay",
          type: "list",
          message: "How would you like to pay today? Use your...",
          choices: ["saved card", "BamPay account"]
        },
        {
          name: "howShip",
          type: "list",
          message: "How fast do you need it?",
          choices: ["today!", "tomorrow", "in a few days", "in 5 to 7 days"]
        },
      ]).then(user => {

        let qtyUpdate;

        prodSelect.forEach(item => {

          console.log(item.item_id, user.itemChoice);
          console.log(item.stock_qty, user.qtyChoice);

          if (item.item_id == user.itemChoice
            && item.stock_qty >= user.qtyChoice) {

            qtyUpdate = item.stock_qty - user.qtyChoice;

          } else {

            qtyUpdate = item.stock_qty;
          }
        })

        console.log(qtyUpdate)


        db.query("UPDATE products SET ? WHERE ?",
        [
          {
            stock_qty: qtyUpdate
          },
          {
            item_id: user.itemChoice
          }
        ],
        (err) => {

          if (err) throw err;

        });



        db.query("SELECT * FROM products WHERE item_id = ?", [user.itemChoice], (err, selectedItem) => {

          if (err) throw err;


          selectedItem.forEach(item => {

            if (user.qtyChoice <= item.stock_qty) {
              console.log(`
        You ordered ${user.qtyChoice} ${item.product_name} @ $${item.price} scheduled to be delivered ${user.howShip}. Your ${user.howPay} will be charged`);

              confirmSale();

            } else {

              console.log(`
          There is insufficient quantity in stock. Please check available quantities and try again`)

              continueShop();
            }

          })

        });

      });

    });

}

// function to confirm purchase
const confirmSale = () => {

  inquirer.prompt([

    {
      name: "confirmPurchase",
      type: "confirm",
      message: "Please confirm.",
      default: "Y"
    }
  ]).then(user => {

    if (user.confirmPurchase) {

      console.log("Your order is on its way! Continue shopping?");

      continueShop();

    } else {

      console.log("Your order was cancelled and you have not been charged. Continue shopping?");

      continueShop();

    }




  })

}

const continueShop = () => {

  inquirer.prompt([

    {
      name: "continue",
      type: "confirm",
      message: "Choose Y to continue.",
      default: "Yes"
    }
  ]).then(user => {

    if (user.continue) {

      mainMenu();

    } else {

      console.log("Thank you for shopping with Bamazon! Come again soon.");

      db.end();
    }

  });

}