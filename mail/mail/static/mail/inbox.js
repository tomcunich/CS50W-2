document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  document.querySelector('#compose-form').addEventListener('submit', send_data);
  
  // By default, load the inbox
  load_mailbox('inbox');

});

function archived(id) {
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: true
    })
  
  });

}

function unarchived(id) {
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: false
    })
  
  });

}

function replyform(id) {

  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email').style.display = 'none';

  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(replyemail => {

    //define variables
    const replyrecipient = document.querySelector('#compose-recipients');
    const replysubject = document.querySelector('#compose-subject');
    const replybodyplaceholder = document.querySelector('#compose-body');
  
    //save placeholders ect
    replyrecipient.value = replyemail.sender;
    replysubject.value = replyemail.subject;
    if (replysubject.value.startsWith("Re: ") ) {

    } else {
      replysubject.value = "Re: " + replyemail.subject;
    }
    replybodyplaceholder.value = `On ${replyemail.timestamp}, ${replyemail.recipients} wrote: "${replyemail.body}".`;


});
}



function load_email(id) {
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email').style.display = 'block';

  //gets the data
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
    //Update parts of page
    document.querySelector('#emailsubject').innerHTML = `Subject: ${email.subject}`;
    document.querySelector('#emailrecipient').innerHTML = `Recipient: ${email.recipients}`;
    document.querySelector('#emailbody').innerHTML = `Body: ${email.body}`;
    document.querySelector('#emailtimestamp').innerHTML = `Subject: ${email.timestamp}`;

    //update button
   const button = document.querySelector('#archive');
   button.addEventListener('click', function() {
    if (email.archived === false) {
      archived(email.id);
      button.innerHTML = `Unrchive`;
    }
    else {
      unarchived(email.id);
      button.innerHTML = `Archive`;
    }
   });

    fetch(`/emails/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
          read: true
      })
    
    });

    //Reply Funcion
    document.querySelector("#replybutton").addEventListener('click', function(){
      replyform(email.id);
    });
  
    
  });
}

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';


  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#email').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    // Print emails
    console.log(emails);
    // ... do something else with emails ...
    emails.forEach(email => {

      const newdiv = document.createElement('div');
      newdiv.id = 'box';
      newdiv.innerHTML = `
        <h6> To: ${email.recipients} </h6>
        <p> About: ${email.subject} </p>
        <p> Body: ${email.body} </p>
        <p> When: ${email.timestamp} </p>
      `;

      newdiv.className = email.read ? 'read' : 'unread';
      newdiv.addEventListener('click', function() {
        load_email(email.id)

      });
      document.querySelector('#emails-view').append(newdiv);
      

    });
});
}

function send_data(event) {
   //save inputs in variables 
  event.preventDefault();

  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;

  //get the API file 
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body,

    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
  });


  load_mailbox('sent');
  
}