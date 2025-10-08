public with sharing class LazyLoadContactsController {
    @AuraEnabled(cacheable=true)
    public static List<Contact> fetchContacts(Integer offsetSize, Integer limitSize) {
        return [
            SELECT Id, Name, Email, Phone
            FROM Contact
            ORDER BY CreatedDate DESC
            LIMIT :limitSize OFFSET :offsetSize
        ];
    }

    @AuraEnabled(cacheable=true)
    public static Integer getTotalCount() {
        return [SELECT COUNT() FROM Contact];
    }
}
