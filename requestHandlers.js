
var sql     = require('mssql');
var http    = require('http');
var https   = require('https');

const sqlConfig = {
  user: 'sa',
  password: "T@ttoka2017",
  database: 'jur_vesta',
  server: 'localhost',
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  },
  options: {
    encrypt: true, // for azure
    trustServerCertificate: true // change to true for local dev / self-signed certs
  }
}


function start( req, res ) {
  console.log("start")	
  res.end( "start is " )
}

function  StartProcess ( path, req, res ) {
  console.log(path)
  console.log(req.query)
  console.log(req.body)
  switch( path.toLowerCase() ) {
    case '/':                       res.end('start is');break;
    // case '/jur_login':              method( 'jur_login', req, res);break;
    // case '/jur_info':               method( 'jur_info', req, res );break;
    // case '/jur_profile1':           method( 'jur_profile', req, res );break;
    // case '/jur_indications':        method( 'jur_indications', req, res );break;
    // case '/jur_invoices':           invoices( req, res );break;
    // case '/jur_actsverki':          actSverki( req, res );break;
    // case '/jur_invoice_image':      method1( req, res );break;
    default:                            reqAPI( path.substring(1), req, res  ); break;
    // default :                       method( 'default', req, res );break;
  }
  
}

async function  getdata ( path,  params, f_success, f_error ) {
  try {      
    // make sure that any items are correctly URL encoded in the connection string
      await sql.connect(sqlConfig)
      const result = await sql.query`exec ${'p_'+path}  ${JSON.stringify( params )} `
      if(  result.recordset[0].data !== undefined )
        f_success( result.recordset[0].data )
      else 
        f_error()
  } catch (err) {
    console.log(err)
    f_error()
  }
}

function        method( path, req, res) {

  console.log( path )

  if( req.route.stack[0].method === 'get') params = req.query 
  else params =  req.body 
  console.log(params)
  getdata( path, params, 

    (ch)=>{
      console.log(path, JSON.parse(ch) )
      res.writeHead(200, { 'Content-Type': 'application/json;charset=utf8' });
      res.write( ch );
      res.end()
    },

    (ch)=>{
      console.log(ch)
      res.writeHead(200, { 'Content-Type': 'application/json;charset=utf8' });
      res.write( '{"error": true, "message": "Упс... какая то ошибка "}' );      
      res.end()
    }

  )

}

function        method1( req, res){

  if( req.route.stack[0].method === 'get') params = req.query 
  else params =  req.body 
  console.log(params)
  getdata( 'jur_invoice_image', params, 

    (ch)=>{
      console.log(ch)

      request('jur_invoice', JSON.parse(ch)
          , (ch)=>{
            res.writeHead(200, { 'Content-Type': 'application/json;charset=utf8' });
            res.write( ch );
            res.end()      
          }
          , ()=>{
            res.writeHead(200, { 'Content-Type': 'application/json;charset=utf8' });
            res.write( '{"error": true, "message": "Упс.. Какая то ошибка"}' );
            res.end()      

          }
      )

    },

    (ch)=>{
      console.log(ch)
      res.writeHead(200, { 'Content-Type': 'application/json;charset=utf8' });
      res.write( '{"error": true, "message": "Упс... какая то ошибка "}' );      
      res.end()
    }

  )

}

function        request( method, post_data, func1, func2 ){
  var options = {
    host: 'fhd.aostng.ru',
    port: 443,
    path: encodeURI('/Reports/hs/API/V1/' + method),
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    }
  };


  var req_ = https.request(options, function(res_) {
    
    res_.setEncoding('utf8');
    var data = '';
    res_.on('data', function (chunk) {
      data = data + chunk
    });

    res_.on('end', function(e) {
      func1( data)
    })

  });

  
  req_.on('error', function(e) {
      console.log( e.message )

      func2( e )

  });

  req_.write(JSON.stringify( post_data ));
  req_.end();
}

function        actSverki( req, res){

  if( req.route.stack[0].method === 'get') params = req.query 
  else params =  req.body 
  console.log(params)

  getdata("jur_id", params
      , (ch)=>{ 
        console.log(JSON.parse(ch))
        reqAPI1("jur_actsverki", JSON.parse(ch)
          ,(ch)=>{
            console.log(JSON.parse(ch))
            res.writeHead(200, { 'Content-Type': 'application/json;charset=utf8' });
            res.write( ch );
            res.end()          
          }
          ,(e)=>{
            res.writeHead(200, { 'Content-Type': 'application/json;charset=utf8' });
            res.write( '{"error": true, "message": "Упс.. Какая то ошибка"}' );
            res.end()              
          }
        )
      }
      , (e)=>{
        res.writeHead(200, { 'Content-Type': 'application/json;charset=utf8' });
        res.write( '{"error": true, "message": "Упс.. Какая то ошибка"}' );
        res.end()          
      }
  )
 
}

function        invoices( req, res){

  if( req.route.stack[0].method === 'get') params = req.query 
  else params =  req.body 
  console.log(params)

  getdata("jur_id", params
      , (ch)=>{ 
        console.log(JSON.parse(ch))
        reqAPI1("jur_invoices", JSON.parse(ch)
          ,(ch)=>{
            console.log(JSON.parse(ch))
            res.writeHead(200, { 'Content-Type': 'application/json;charset=utf8' });
            res.write( ch );
            res.end()          
          }
          ,(e)=>{
            res.writeHead(200, { 'Content-Type': 'application/json;charset=utf8' });
            res.write( '{"error": true, "message": "Упс.. Какая то ошибка"}' );
            res.end()              
          }
        )
      }
      , (e)=>{
        res.writeHead(200, { 'Content-Type': 'application/json;charset=utf8' });
        res.write( '{"error": true, "message": "Упс.. Какая то ошибка"}' );
        res.end()          
      }
  )
 
}

function        reqAPI(method, req, res) {
  var params = req.route.stack[0].method === 'get' ? req.query : req.body;

  var options = {
    host:     'dmz.aostng.ru',
    path:     encodeURI('/jur/' + method),
    method:   'POST',
    headers: {

      'Content-Type': 'application/json'

    }
  };

  console.log( method );

  console.log('Full URL:', `http://${options.host}:${options.port}${options.path}`);

  var req_ = https.request(options, function(res_) {
    res_.setEncoding('utf8');
    var data = '';
    res_.on('data', function (chunk) {
      data = data + chunk;
    });

    res_.on('end', function() {
      console.log('end', data);
      res.writeHead(200, { 'Content-Type': 'application/json;charset=utf8' });
      res.write(data);
      res.end();
    });
  });

  req_.on('error', function(e) {
    console.log('error', method, params);
    console.log(e);
    res.writeHead(200, { 'Content-Type': 'application/json;charset=utf8' });
    res.write(JSON.stringify({ error: true, message: e.message }));
    res.end();
  });

  // Если метод - getVersion, то отправляем пустой объект, иначе params
  var requestData = method === 'getVersion' ? {} : params;
  req_.write(JSON.stringify(requestData));
  req_.end();

}

function        reqAPI1( method, req, res){
  var options = {
    host:     '83.169.226.130',
    port:     44302,
    path:     encodeURI('/vesta/hs/API_STNG/' + method),
    method:   'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  };

  if( req.route.stack[0].method === 'get') params = req.query 
  else params =  req.body 

  console.log("reqapi1")

  console.log( params )

  console.log( options)
  var req_ = http.request(options, function(res_) {
    
    res_.setEncoding('utf8');
    var data = '';
    res_.on('data', function (chunk) {
      data = data + chunk
    });

    res_.on('end', function(e) {
      console.log( method )
      console.log( params )
      console.log(data)
      res.writeHead(200, { 'Content-Type': 'application/json;charset=utf8' });
      res.write( data );
      res.end()    
    })

  });

  
  req_.on('error', function(e) {
    console.log( method )
    console.log( params )
    console.log( e.message )
    res.writeHead(200, { 'Content-Type': 'application/json;charset=utf8' });
    res.write( '{"error": true, "message": "Упс.. Какая то ошибка"}' );
    res.end()      
  });

  req_.write(JSON.stringify( params ));
  req_.end();

}


function        sendSMS( phone, pincode, f_success, f_error ){
  var options = {
    host: 'sms.ru',
    port: 443,
    path: encodeURI('/sms/send?api_id=3CB08DC6-9840-1B95-BD99-F7F4652912AE&to=' + phone + '&msg=' + pincode + '&json=1'),
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  };

  var req_ = https.request(options, function(res_) {
    res_.setEncoding('utf8');
    res_.on('data', function (chunk) {
      
      console.log('Пароль отправлен')

      f_success()

    });
  });
  
  req_.on('error', function(e) {
      console.log( e.message )
      f_error(e)
  });

  req_.end();

}


exports.start         = start;
exports.method        = method;
exports.StartProcess  = StartProcess;
