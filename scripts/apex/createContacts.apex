// Anonymous Apex script to insert 100 Contact records for testing
// Run with: sfdx force:apex:execute -f scripts/apex/createContacts.apex

List<Contact> contacts = new List<Contact>();
for (Integer i = 1; i <= 100; i++) {
    contacts.add(new Contact(
        FirstName = 'TestFirst' + i,
        LastName = 'TestLast' + i,
        Email = 'test' + i + '@example.com',
        Phone = '555-010' + (i < 10 ? '0' + i : String.valueOf(i)),
        Description = 'Created by script scripts/apex/createContacts.apex'
    ));
}

try {
    insert contacts;
    System.debug('Inserted ' + contacts.size() + ' contacts.');
} catch (Exception e) {
    System.debug('Error inserting contacts: ' + e.getMessage());
}
