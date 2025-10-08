@IsTest
private class LazyLoadContactsServerControllerTest {

    @TestSetup
    static void setupData() {
        // Create 25 contacts for testing
        List<Contact> testContacts = new List<Contact>();
        for (Integer i = 0; i < 25; i++) {
            testContacts.add(new Contact(
                FirstName = 'ServerTest',
                LastName = 'Contact' + i,
                Email = 'servertest' + i + '@example.com',
                Phone = '555-000-' + String.valueOf(1000 + i)
            ));
        }
        insert testContacts;
    }

    @IsTest
    static void testFetchContactsBasic() {
        Test.startTest();
        List<Contact> contacts = LazyLoadContactsServerController.fetchContacts('', 0, 10);
        Test.stopTest();

        System.assertNotEquals(0, contacts.size(), 'Contacts should be returned');
        System.assertEquals(10, contacts.size(), 'Should return 10 records for first batch');
    }

    @IsTest
    static void testFetchContactsWithOffset() {
        Test.startTest();
        List<Contact> firstBatch = LazyLoadContactsServerController.fetchContacts('', 0, 10);
        List<Contact> secondBatch = LazyLoadContactsServerController.fetchContacts('', 10, 10);
        Test.stopTest();

        // Validate pagination: ensure that the first record ids differ
        System.assertNotEquals(firstBatch[0].Id, secondBatch[0].Id, 'Batches should not overlap');
        System.assertEquals(10, secondBatch.size(), 'Second batch should also have 10 records');
    }

    @IsTest
    static void testFetchContactsEmptyOffset() {
        Test.startTest();
        List<Contact> emptyList = LazyLoadContactsServerController.fetchContacts('', 1000, 10);
        Test.stopTest();

        System.assertEquals(0, emptyList.size(), 'Should return empty list when offset exceeds total count');
    }

    @IsTest
    static void testGetTotalCount() {
        Test.startTest();
        Integer count = LazyLoadContactsServerController.getTotalCount('');
        Test.stopTest();

        System.assert(count > 0, 'Total contact count should be greater than 0');
        System.assertEquals(25, count, 'Expected 25 contacts created in test setup');
    }

    @IsTest
    static void testSearchKeyFiltering() {
        Test.startTest();
        // Search for 'Contact1' should match Contact1, Contact10, Contact11, etc.
        List<Contact> filtered = LazyLoadContactsServerController.fetchContacts('Contact1', 0, 50);
        Integer totalFiltered = LazyLoadContactsServerController.getTotalCount('Contact1');
        Test.stopTest();

        System.assert(filtered.size() > 0, 'Filtered results should be returned for search key');
        System.assertEquals(filtered.size(), totalFiltered, 'getTotalCount should match number of filtered records returned');
        for (Contact c: filtered) {
            System.assert(c.Name.contains('Contact1'), 'Returned contact should match the search key in Name: ' + c.Name);
        }
    }
}
