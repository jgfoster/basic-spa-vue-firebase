! ------- Create dictionary if it is not present
run
| aSymbol names userProfile |
aSymbol := #'MasteryGlobals'.
userProfile := System myUserProfile.
names := userProfile symbolList names.
(names includes: aSymbol) ifFalse: [
	| symbolDictionary |
	symbolDictionary := SymbolDictionary new name: aSymbol; yourself.
	userProfile insertDictionary: symbolDictionary at: names size + 1.
].
%
! ------------------- Class definition for CachedObject
expectvalue /Class
doit
Object subclass: 'CachedObject'
  instVarNames: #()
  classVars: #()
  classInstVars: #( cache)
  poolDictionaries: #()
  inDictionary: MasteryGlobals
  options: #()

%
expectvalue /Class
doit
CachedObject comment:
'No class-specific documentation for CachedObject, hierarchy is:
Object
  WebApp( begin end exception html request response)
    CachedObject
'
%
expectvalue /Class
doit
CachedObject category: 'Mastery'
%
! ------------------- Class definition for Session
expectvalue /Class
doit
CachedObject subclass: 'Session'
  instVarNames: #( expires token username)
  classVars: #()
  classInstVars: #()
  poolDictionaries: #()
  inDictionary: MasteryGlobals
  options: #()

%
expectvalue /Class
doit
Session comment:
'No class-specific documentation for Session, hierarchy is:
Object
  WebApp( begin end exception html request response)
    Session( username expires)
'
%
expectvalue /Class
doit
Session category: 'Mastery'
%
! ------------------- Class definition for Mastery
expectvalue /Class
doit
WebApp subclass: 'Mastery'
  instVarNames: #( data result)
  classVars: #( Sessions)
  classInstVars: #()
  poolDictionaries: #()
  inDictionary: MasteryGlobals
  options: #()

%
expectvalue /Class
doit
Mastery comment:
'No class-specific documentation for Mastery, hierarchy is:
Object
  WebApp( begin end exception html request response)
    Mastery
'
%
expectvalue /Class
doit
Mastery category: 'Mastery'
%

! ------------------- Remove existing behavior from CachedObject
expectvalue /Metaclass3
doit
CachedObject removeAllMethods.
CachedObject class removeAllMethods.
%
! ------------------- Class methods for CachedObject
set compile_env: 0
category: 'other'
classmethod: CachedObject
cache

	^cache ifNil: [cache := IdentitySet new]
%
! ------------------- Instance methods for CachedObject

! ------------------- Remove existing behavior from Session
expectvalue /Metaclass3
doit
Session removeAllMethods.
Session class removeAllMethods.
%
! ------------------- Class methods for Session
set compile_env: 0
category: 'other'
classmethod: Session
expireSessions

	self cache copy do: [:each |
		each isExpired ifTrue: [
			self cache remove: each.
		].
	].
%
category: 'other'
classmethod: Session
forToken: aString

	self expireSessions.
	^self cache detect: [:each | each token = aString]
%
category: 'other'
classmethod: Session
new

	self error: 'Use token:username:'
%
category: 'other'
classmethod: Session
newWithUsername: aString

	^self cache add: (self basicNew
		initialize: aString;
		yourself)
%
! ------------------- Instance methods for Session
set compile_env: 0
category: 'other'
method: Session
initialize: usernameString

	| random |
	random := Random new.
	token := ((random integer bitShift: 28) + (random integer bitAnd: 16r0FFFFFFF)) printStringRadix: 36.
	expires := System timeGmt + (4 * 60 * 60).		"four hours"
	username := usernameString.
%
category: 'other'
method: Session
isExpired

	^expires < System timeGmt
%
category: 'other'
method: Session
signout

	expires := 0.
	self class expireSessions.
%
category: 'other'
method: Session
token

	^token
%
category: 'other'
method: Session
username

	^username
%

! ------------------- Remove existing behavior from Mastery
expectvalue /Metaclass3
doit
Mastery removeAllMethods.
Mastery class removeAllMethods.
%
! ------------------- Class methods for Mastery
set compile_env: 0
category: 'other'
classmethod: Mastery
clearSessions
"
	Mastery clearSessions.
"
	Sessions := nil.
%
category: 'other'
classmethod: Mastery
sessions
"
	Mastery sessions.
"
	^Sessions
%
category: 'other'
classmethod: Mastery
workerCount
	"Do our primary work in the main session"

	^0
%
! ------------------- Instance methods for Mastery
set compile_env: 0
category: 'other'
method: Mastery
authenticate: username password: password

	| baseDn isAuthentic servers |
	servers := Array with: 'ldap://auth.cs.wallawalla.edu:389'.
	baseDn := 'ou=Users,dc=cs,dc=wallawalla,dc=edu'.
	isAuthentic := System
		validatePasswordUsingLdapServers: servers
		baseDn: baseDn
		filterDn: '(uid=%s)'
		userId: username
		password: password.
	isAuthentic ifFalse: [self error: 'Invalid credentials'].
%
category: 'other'
method: Mastery
buildResponseFor: aString

	| endTime json startTime |
	startTime := Time millisecondClockValue.
	result := Dictionary new
		at: 'success' put: true;
		yourself.
	[
		data := request bodyContents
			ifNil: [Dictionary new]
			ifNotNil: [:value | JsonParser parse: value].
		data isPetitFailure ifTrue: [self error: data message].

		super buildResponseFor: aString.
	] on: Admonition, Error do: [:ex |
		GsFile gciLogServer: (GsProcess stackReportToLevel: 40).
		result
			at: 'success' put: false;
			at: 'error' put: ex description;
			yourself.
	].
	endTime := Time millisecondClockValue.
	result at: 'time' put: endTime - startTime.
	json := result asJson.
	GsFile gciLogServer: aString , '=>' , json.
	response
		content: result asJson;
		yourself.
%
category: 'other'
method: Mastery
cookieKey

	^'session'
%
category: 'other'
method: Mastery
session

	^Session forToken: (request cookies at: self cookieKey)
%
category: 'other'
method: Mastery
sessions

	^Sessions ifNil: [Sessions := StringKeyValueDictionary new]
%
category: 'other'
method: Mastery
signin_gs

	| password session username |
	username := data at: 'username'.
	password := data at: 'password'.
	self authenticate: username password: password.
	session := Session newWithUsername: username.
	result at: 'username' put: username.
	response
		setCookie: self cookieKey
		value: session token
		path: nil
		maxAge: 4 * 60 * 60	"4 hours"
		secure: false
		serverOnly: true
		sameSite: true.
%
category: 'other'
method: Mastery
signout_gs

	self session signout.
%
category: 'other'
method: Mastery
username_gs

	^[
		self session username
	] on: Error do: [:ex |
		ex return: nil
	]
%
