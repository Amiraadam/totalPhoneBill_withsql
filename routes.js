import express from 'express';
import * as sqlite from 'sqlite';
import sqlite3 from 'sqlite3';
import cors from 'cors';
import totalPhoneBill from './totalPhoneBill.js';

const app = express();
const PORT = process.env.PORT || 4011;

app.use(express.json());


const  db = await sqlite.open({
    filename:  './data_plan.db',
    driver:  sqlite3.Database
});

await db.migrate();


//total phoneBill calc
app.post('/api/phonebill/', async (req, res) => {
  const { plan_name, actions } = req.body;
  const bill = actions
  const data = await db.get('SELECT * from price_plan WHERE plan_name = $1', [plan_name]);
  //const smsPrice = await db.get('SELECT sms_price from price_plan WHERE plan_name = $1', [plan_name]);
  console.log(data)
  const total = totalPhoneBill(bill, data.sms_price, data.call_price);
 res.json({ total});
});


// creating a price plan
app.post('/api/price_plan/create' , async (req, res) => {
    const { plan_name, sms_price, call_price } = req.body;
    await db.run('INSERT into price_plan (plan_name, sms_price , call_price) values (?,?,?)', [plan_name, sms_price, call_price] );
    /*if (!plan_name || !call_cost || !sms_cost) {
        return res.status(400).json({ error: 'Missing required fields' });
    }*/
    res.json({message: 'plan created'});
});

//getting all price plans
app.get('/api/price_plans/', async (req, res) => {
    
    const plans = await db.all('SELECT plan_name FROM price_plan');
    res.json({plans})
});


//Delete a price plan
app.post('/api/price_plan/delete', async (req, res) => {
  const { plan_name } = req.body;
  await db.run('delete from price_plan where plan_name = $1', [plan_name]);
  res.json({message: 'plan deleted}'});
});

//Update a price plan
app.post('/api/price_plan/update', async (req, res) => {
    const { plan_name, sms_price, call_price } = req.body;
    await db.run('UPDATE price_plan set sms_price = $1, call_price = $2 where plan_name =$3', [ sms_price, call_price, plan_name] );
    let all = await db.all('select * from price_plan')
    res.json({message: 'plan updated',
        data: all
    });
})

app.listen(PORT, () =>  {
    console.log('Server started on ${PORT}');
});