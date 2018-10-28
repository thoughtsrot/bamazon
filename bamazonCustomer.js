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

                if (product.stock_qty < 1) {
                  console.log(`
          Product: ${product.product_name}
          Price: $${product.price}
          **ITEM OUT OF STOCK!** Check back soon.
          Item #: ${product.item_id}
        `)
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
        console.log(`
        Product: ${product.product_name}
        Price: $${product.price}
        Quantity Remaining: ${product.stock_qty}
        Item #: ${product.item_id}
        `);
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
      console.log(`
      Product: ${product.product_name}
      Price: $${product.price}
      Quantity Remaining: ${product.stock_qty}
      Item #: ${product.item_id}
      `);

    });

    selectItem();
  });

}

// function for choosing a specific item by item #
const selectItem = () => {

  const query = db.query("SELECT * FROM products",
    (err, prodData) => {
      if (err) throw err;

      // ask for item #
      inquirer.prompt([
        {
          name: "itemChoice",
          type: "input",
          message: "Please enter the item # of the product you wish to purchase",
          // validate: (itemInput) => {

          //   const idArray = prodByDept.map(item => item.item_id);

          //   console.log(`
          //   Array: ${idArray}`)

          //   if (idArray.includes(itemInput)) {

          //     return true;

          //   } else {

          //     console.log(`
          //     Sorry.

          //     We couldn't locate that item.

          //     Please enter the item # exactly as it appears in the description.`);

          //     return false;
          //   }

          // }
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
        }
      ]).then(user => {

        console.log(prodData.stock_qty);
        console.log(user.qtyChoice);


        // define if conditional to check if user qty is less than or equal to current product qty
        if (user.qtyChoice <= prodData.stock_qty) {

          console.log(`
        You are about to purchase ${user.qtyChoice} of the following item:`);

          const query = db.query("SELECT * FROM products WHERE item_id = ?",
            [user.itemChoice], (err, prodById) => {

              if (err) throw err;

              prodById.forEach((product) => {

                console.log(`Product: ${product.product_name}
      @ $${product.price} each.
    `)
              });

              // confirmSale();

            });

        } else {

          console.log(`
          There is insufficient quantity in stock. Please check available quantities and try again`)

          selectItem();
        }


      })

      // Close db.query here
    });
}

// function to confirm sale/payment method/shipment method of item
// const confirmSale = () => {

// }